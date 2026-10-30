"""Visitor counting for the dashboard (privacy-friendly: no IPs or cookies are stored)."""

import hashlib
import re
from collections import defaultdict
from datetime import datetime, time, timedelta

from django.conf import settings
from django.db.models import Count
from django.db.models.functions import TruncDate
from django.utils import timezone

from .models import PageVisit

BOTS = re.compile(r'bot|crawl|spider|slurp|facebookexternalhit|preview|monitor', re.I)
MOBILE = re.compile(r'mobi|android|iphone|ipad', re.I)
# Views by the same visitor further apart than this start a new session.
SESSION_GAP = timedelta(minutes=30)


def client_ip(request):
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR', '')
    return forwarded.split(',')[0].strip() if forwarded else request.META.get('REMOTE_ADDR', '')


def record_visit(request, path):
    """Saves a page view; returns False for bots."""
    agent = request.META.get('HTTP_USER_AGENT', '')
    if not agent or BOTS.search(agent):
        return False
    day = timezone.localdate().isoformat()
    visitor = hashlib.sha256(f'{settings.SECRET_KEY}|{day}|{client_ip(request)}|{agent}'.encode()).hexdigest()[:32]
    PageVisit.objects.create(path=path[:200], visitor=visitor, is_mobile=bool(MOBILE.search(agent)))
    return True


def _period(start, end):
    """Totals for visits in [start, end)."""
    visits = PageVisit.objects.filter(created_at__gte=start, created_at__lt=end)
    views = visits.count()
    visitors = visits.values('visitor').distinct().count()
    mobile = visits.filter(is_mobile=True).values('visitor').distinct().count()

    # Session length: first to last view of a visit (views less than 30 minutes apart).
    times = defaultdict(list)
    for visitor, at in visits.order_by('created_at').values_list('visitor', 'created_at'):
        times[visitor].append(at)
    durations = []
    for stamps in times.values():
        first = last = stamps[0]
        for at in stamps[1:]:
            if at - last > SESSION_GAP:
                durations.append((last - first).total_seconds())
                first = at
            last = at
        durations.append((last - first).total_seconds())

    return {
        'views': views,
        'visitors': visitors,
        'avg_session_seconds': round(sum(durations) / len(durations)) if durations else 0,
        'mobile_percent': round(mobile * 100 / visitors) if visitors else 0,
    }


def _change(current, previous):
    """Percentage change, or None when there is nothing to compare with."""
    if not previous:
        return None
    return round((current - previous) * 100 / previous)


def overview(days):
    """Daily visitors and totals for the last `days` days (today included), compared with the days before."""
    today = timezone.localdate()
    first_day = today - timedelta(days=days - 1)
    tz = timezone.get_current_timezone()
    start = timezone.make_aware(datetime.combine(first_day, time.min), tz)
    end = start + timedelta(days=days)
    previous_start = start - timedelta(days=days)

    daily = dict(
        PageVisit.objects.filter(created_at__gte=start, created_at__lt=end)
        .annotate(day=TruncDate('created_at', tzinfo=tz))
        .values('day')
        .annotate(visitors=Count('visitor', distinct=True))
        .values_list('day', 'visitors')
    )
    series = [
        {'date': (first_day + timedelta(days=i)).isoformat(), 'visitors': daily.get(first_day + timedelta(days=i), 0)}
        for i in range(days)
    ]
    current, previous = _period(start, end), _period(previous_start, start)
    return {
        'series': series,
        'totals': current,
        'changes': {key: _change(current[key], previous[key]) for key in current},
    }
