from django.db import models
from django.utils import timezone

from core.validators import MaxFileSizeValidator, validate_photo_extension

IMAGE_VALIDATORS = [validate_photo_extension, MaxFileSizeValidator(5)]


class EventCategory(models.TextChoices):
    MASS = 'mass', 'Mass'
    RETREAT = 'retreat', 'Retreat'
    CELEBRATION = 'celebration', 'Special Celebration'
    THANKSGIVING = 'thanksgiving', 'Thanksgiving'
    PRAYER = 'prayer', 'Prayer & Devotion'
    YOUTH = 'youth', 'Youth'
    TALK = 'talk', 'Talk'
    OTHER = 'other', 'Other'


class NewsCategory(models.TextChoices):
    ANNOUNCEMENT = 'announcement', 'Announcement'
    PARISH_ACTIVITY = 'parish_activity', 'Parish Activity'
    OUTREACH = 'outreach', 'Outreach'
    OTHER = 'other', 'Other'


class Post(models.Model):
    """Fields shared by events and news posts."""

    title = models.CharField(max_length=150)
    short_description = models.CharField(max_length=300)
    # Plain text; a blank line starts a new paragraph.
    content = models.TextField()
    image = models.ImageField(upload_to='news_events/', blank=True, null=True, validators=IMAGE_VALIDATORS)
    is_published = models.BooleanField('published', default=True, db_index=True)
    # Highlighted on the homepage (once it exists).
    is_featured = models.BooleanField('featured', default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    def __str__(self):
        return self.title


class Event(Post):
    starts_at = models.DateTimeField('date & time', db_index=True)
    location = models.CharField(max_length=200, blank=True)
    category = models.CharField(max_length=20, choices=EventCategory.choices, default=EventCategory.OTHER)

    class Meta:
        ordering = ['starts_at', 'id']


class NewsPost(Post):
    published_on = models.DateField('publish date', default=timezone.localdate, db_index=True)
    category = models.CharField(max_length=20, choices=NewsCategory.choices, default=NewsCategory.ANNOUNCEMENT)

    class Meta:
        ordering = ['-published_on', '-id']
        verbose_name = 'news post'


DEFAULT_PAGE = {
    'hero_title': 'News & Events',
    'hero_subtitle': 'Stay informed about our parish activities, announcements and upcoming events.',
    'cta_title': 'Join Our Parish Community',
    'cta_text': 'Take part in our parish activities, grow in faith and make a difference.',
}


class NewsEventsPage(models.Model):
    """Hero and bottom banner of the public News & Events page. One row (pk=1)."""

    SINGLETON_PK = 1

    hero_title = models.CharField(max_length=150)
    hero_subtitle = models.CharField(max_length=300, blank=True)
    hero_image = models.ImageField(upload_to='news_events/', blank=True, null=True, validators=IMAGE_VALIDATORS)
    cta_title = models.CharField('call-to-action title', max_length=150, blank=True)
    cta_text = models.CharField('call-to-action text', max_length=300, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'News & Events page'
        verbose_name_plural = 'News & Events page'

    def __str__(self):
        return 'News & Events page'

    def save(self, *args, **kwargs):
        self.pk = self.SINGLETON_PK
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=cls.SINGLETON_PK, defaults=DEFAULT_PAGE)
        return obj
