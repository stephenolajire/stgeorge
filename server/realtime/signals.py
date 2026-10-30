from django.db.models.signals import post_delete, post_save

from core.signals import bulk_changed

from .broadcast import broadcast_change, send_change


def watch(model, topic):
    """Broadcast `topic` whenever a row of `model` is saved or deleted."""

    def changed(sender, **kwargs):
        broadcast_change(topic)

    uid = f'realtime-{model._meta.label_lower}'
    post_save.connect(changed, sender=model, weak=False, dispatch_uid=f'{uid}-save')
    post_delete.connect(changed, sender=model, weak=False, dispatch_uid=f'{uid}-delete')
    # Reordering uses bulk_update, which skips post_save.
    bulk_changed.connect(lambda sender, **kwargs: send_change(topic), sender=model, weak=False, dispatch_uid=f'{uid}-bulk')


def connect_signals():
    # Imported here so the apps are fully loaded first.
    from about.models import AboutPage
    from clergy_staff.models import Member
    from contact.models import FAQ, ContactMessage, ContactPage
    from gallery.models import GalleryPage, Photo
    from projects.models import Project, ProjectsPage
    from home.models import HomeHighlight, HomePage, QuickLink, Subscriber
    from news_events.models import Event, NewsEventsPage, NewsPost
    from parish_groups.models import ParishGroup
    from parish_life.models import Activity, Highlight, ParishLifePage
    from sacraments.models import Sacrament, SacramentFeature, SacramentsPage

    # model -> topic sent to the browser (the frontend maps topics to what it reloads)
    watch(AboutPage, 'about')
    watch(Member, 'clergy')
    watch(ParishLifePage, 'parish-life')
    watch(Highlight, 'parish-life')
    watch(Activity, 'parish-life')
    watch(ParishGroup, 'parish-groups')
    watch(Sacrament, 'sacraments')
    watch(SacramentsPage, 'sacraments')
    watch(SacramentFeature, 'sacraments')
    watch(Photo, 'gallery')
    watch(GalleryPage, 'gallery')
    watch(Event, 'news-events')
    watch(NewsPost, 'news-events')
    watch(NewsEventsPage, 'news-events')
    watch(ContactPage, 'contact')
    watch(FAQ, 'contact')
    watch(HomePage, 'home')
    watch(Project, 'projects')
    watch(ProjectsPage, 'projects')
    watch(HomeHighlight, 'home')
    watch(QuickLink, 'home')
    # Messages only matter to the admin; the frontend reloads only admin data for this topic.
    watch(ContactMessage, 'contact-messages')
    watch(Subscriber, 'subscribers')
