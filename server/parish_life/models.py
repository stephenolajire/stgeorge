from django.db import models

from core.choices import CardIcon as HighlightIcon
from core.models import OrderedModel
from core.validators import MaxFileSizeValidator, validate_photo_extension

IMAGE_VALIDATORS = [validate_photo_extension, MaxFileSizeValidator(5)]

DEFAULT_CONTENT = {
    'hero_title': 'Parish Life',
    'hero_subtitle': 'A vibrant community of faith, prayer, formation and service, living the Gospel together in Christ.',
    'intro_title': 'A Vibrant Parish Community',
    'intro_text': (
        'Parish life at St. George Catholic Church, Ofatedo, is centered on worship, faith formation, '
        'fellowship and service. We journey together as a family, supporting one another in our spiritual '
        'growth and living out the values of the Gospel in our daily lives.'
    ),
}


class ParishLifePage(models.Model):
    """Text and images of the public Parish Life page. There is only ever one row (pk=1)."""

    SINGLETON_PK = 1

    # Banner at the top
    hero_title = models.CharField(max_length=150)
    hero_subtitle = models.CharField(max_length=300, blank=True)
    hero_image = models.ImageField(upload_to='parish_life/', blank=True, null=True, validators=IMAGE_VALIDATORS)

    # "Living Our Faith" introduction. Plain text; a blank line starts a new paragraph.
    intro_title = models.CharField(max_length=150, blank=True)
    intro_text = models.TextField(blank=True)
    intro_image = models.ImageField(upload_to='parish_life/', blank=True, null=True, validators=IMAGE_VALIDATORS)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Parish Life page'
        verbose_name_plural = 'Parish Life page'

    def __str__(self):
        return 'Parish Life page'

    def save(self, *args, **kwargs):
        self.pk = self.SINGLETON_PK
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=cls.SINGLETON_PK, defaults=DEFAULT_CONTENT)
        return obj


class Highlight(OrderedModel):
    """A small card in the strip under the banner, e.g. "Worship"."""

    title = models.CharField(max_length=60)
    text = models.CharField(max_length=160)
    icon = models.CharField(max_length=20, choices=HighlightIcon.choices, default=HighlightIcon.CHURCH)

    class Meta(OrderedModel.Meta):
        pass

    def __str__(self):
        return self.title


class Activity(OrderedModel):
    """A card in "Growing Together in Faith". Opening it shows the content."""

    title = models.CharField(max_length=150)
    short_description = models.CharField(max_length=300)
    # Plain text; a blank line starts a new paragraph.
    content = models.TextField()
    image = models.ImageField(upload_to='parish_life/', blank=True, null=True, validators=IMAGE_VALIDATORS)
    is_published = models.BooleanField('published', default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta(OrderedModel.Meta):
        verbose_name_plural = 'activities'

    def __str__(self):
        return self.title
