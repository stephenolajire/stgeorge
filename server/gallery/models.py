from datetime import date

from django.core.validators import FileExtensionValidator
from django.db import models

from core.validators import MaxFileSizeValidator

PHOTO_VALIDATORS = [
    FileExtensionValidator(['jpg', 'jpeg', 'png', 'webp'], 'Upload a JPG, PNG or WebP image.'),
    MaxFileSizeValidator(10),
]


class Category(models.TextChoices):
    MASS_LITURGY = 'mass_liturgy', 'Mass & Liturgy'
    PARISH_EVENTS = 'parish_events', 'Parish Events'
    COMMUNITY = 'community', 'Community'
    SACRAMENTS = 'sacraments', 'Sacraments'
    YOUTH = 'youth', 'Youth'
    OTHERS = 'others', 'Others'


def normalize_tags(value):
    """'mass,  Worship , mass' -> 'mass, Worship' (trimmed, no blanks, no duplicates ignoring case)."""
    seen, tags = set(), []
    for tag in (t.strip() for t in value.split(',')):
        if tag and tag.lower() not in seen:
            seen.add(tag.lower())
            tags.append(tag)
    return ', '.join(tags)


class Photo(models.Model):
    """A photo in the website gallery."""

    image = models.ImageField(upload_to='gallery/%Y/%m/', validators=PHOTO_VALIDATORS)
    title = models.CharField(max_length=150)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.OTHERS, db_index=True)
    description = models.CharField('short description', max_length=500, blank=True)
    date_taken = models.DateField(default=date.today, db_index=True)
    # Comma-separated, e.g. "mass, worship, altar".
    tags = models.CharField(max_length=300, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_taken', '-id']

    def __str__(self):
        return self.title


DEFAULT_PAGE = {
    'hero_title': 'Gallery',
    'hero_subtitle': 'Moments of faith, fellowship and service. Explore photos from our parish activities and celebrations.',
    'cta_title': 'Many Moments, One Family',
    'cta_text': 'Celebrating our journey together in Christ.',
}


class GalleryPage(models.Model):
    """Text and hero image of the public Gallery page. There is only ever one row (pk=1)."""

    SINGLETON_PK = 1

    hero_title = models.CharField(max_length=150)
    hero_subtitle = models.CharField(max_length=300, blank=True)
    hero_image = models.ImageField(upload_to='gallery/page/', blank=True, null=True, validators=PHOTO_VALIDATORS)

    # Banner at the bottom ("Many Moments, One Family")
    cta_title = models.CharField('call-to-action title', max_length=150, blank=True)
    cta_text = models.CharField('call-to-action text', max_length=300, blank=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Gallery page'
        verbose_name_plural = 'Gallery page'

    def __str__(self):
        return 'Gallery page'

    def save(self, *args, **kwargs):
        self.pk = self.SINGLETON_PK
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=cls.SINGLETON_PK, defaults=DEFAULT_PAGE)
        return obj
