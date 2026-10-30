from django.db import models

from core.choices import CardIcon
from core.models import OrderedModel
from core.validators import MaxFileSizeValidator, validate_photo_extension

IMAGE_VALIDATORS = [validate_photo_extension, MaxFileSizeValidator(5)]

# The design's text, used the first time the page is loaded (editable afterwards).
DEFAULT_CONTENT = {
    'hero_title': 'St. George Catholic Church, Ofatedo',
    'hero_tagline': 'Catholic Diocese of Osogbo',
    'hero_text': 'A community of faith, prayer and service, journeying together in Christ.',
    'hero_quote': 'Together as one family in Christ, we live, worship and serve.',
    'about_title': 'A Family Rooted in Faith and Service',
    'about_text': (
        'St. George Catholic Church, Ofatedo, is a vibrant faith community in the Catholic Diocese of Osogbo. '
        'We are committed to worship, evangelisation, charity and the holistic growth of all our members.'
    ),
    'news_title': 'Latest Updates',
    'news_subtitle': 'Stay informed about parish activities, announcements and events.',
    'newsletter_title': 'Be Part of Our Parish Family',
    'newsletter_text': 'Receive updates on Mass schedules, events and parish news.',
}


class HomePage(models.Model):
    """Text and images of the public Home page. There is only ever one row (pk=1)."""

    SINGLETON_PK = 1

    # Welcome banner. Text after the last comma of the title is shown smaller, on its own line.
    hero_title = models.CharField(max_length=150)
    hero_tagline = models.CharField(max_length=150, blank=True)
    hero_text = models.CharField(max_length=300, blank=True)
    hero_quote = models.CharField(max_length=200, blank=True)
    hero_image = models.ImageField(upload_to='home/', blank=True, null=True, validators=IMAGE_VALIDATORS)

    # "About Our Parish". Plain text; a blank line starts a new paragraph.
    about_title = models.CharField(max_length=150, blank=True)
    about_text = models.TextField(blank=True)
    about_image = models.ImageField(upload_to='home/', blank=True, null=True, validators=IMAGE_VALIDATORS)

    # "Latest Updates" heading above the news cards.
    news_title = models.CharField(max_length=150, blank=True)
    news_subtitle = models.CharField(max_length=300, blank=True)

    # "Stay Connected" newsletter banner.
    newsletter_title = models.CharField(max_length=150, blank=True)
    newsletter_text = models.CharField(max_length=300, blank=True)
    newsletter_image = models.ImageField(upload_to='home/', blank=True, null=True, validators=IMAGE_VALIDATORS)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Home page'
        verbose_name_plural = 'Home page'

    def __str__(self):
        return 'Home page'

    def save(self, *args, **kwargs):
        self.pk = self.SINGLETON_PK
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=cls.SINGLETON_PK, defaults=DEFAULT_CONTENT)
        return obj


class HomeHighlight(OrderedModel):
    """A card in the strip under the banner, e.g. "Worship"."""

    title = models.CharField(max_length=60)
    text = models.CharField(max_length=160)
    icon = models.CharField(max_length=20, choices=CardIcon.choices, default=CardIcon.CHURCH)

    class Meta(OrderedModel.Meta):
        pass

    def __str__(self):
        return self.title


class LinkTarget(models.TextChoices):
    """Pages a quick-link card can open. Keys match frontend/src/utils/homeLinks.ts."""

    MASS_TIMES = 'mass_times', 'Mass Times'
    SACRAMENTS = 'sacraments', 'Sacraments'
    PARISH_LIFE = 'parish_life', 'Parish Life (groups and activities)'
    ABOUT = 'about', 'About'
    NEWS_EVENTS = 'news_events', 'News & Events'
    GALLERY = 'gallery', 'Gallery'
    CONTACT = 'contact', 'Contact'


class QuickLink(OrderedModel):
    """A photo card under the upcoming event, e.g. "Mass Schedule", linking to another page."""

    title = models.CharField(max_length=60)
    text = models.CharField(max_length=160)
    image = models.ImageField(upload_to='home/', blank=True, null=True, validators=IMAGE_VALIDATORS)
    link_label = models.CharField(max_length=40)
    target = models.CharField(max_length=20, choices=LinkTarget.choices)

    class Meta(OrderedModel.Meta):
        pass

    def __str__(self):
        return self.title


class Subscriber(models.Model):
    """An email address left in the "Stay Connected" newsletter form."""

    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at', '-id']

    def __str__(self):
        return self.email
