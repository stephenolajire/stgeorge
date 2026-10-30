from django.core.validators import RegexValidator
from django.db import models

DEFAULT_CONTENT = {
    'hero_title': 'About Our Parish',
    'hero_subtitle': 'A community of faith, worship and service in the heart of Ofatedo.',
    'description': (
        'St. George Catholic Church, Ofatedo is a vibrant faith community in the Catholic '
        'Diocese of Osogbo. We are committed to proclaiming the Gospel, celebrating the '
        'sacraments, growing in faith, and serving our community with love.'
    ),
    'mission': (
        'To be a Christ-centred community, proclaiming the Gospel, celebrating the '
        'sacraments, and serving God and humanity with love.'
    ),
    'vision': (
        'A vibrant, united parish where all are welcomed, nurtured in faith, and empowered '
        'to be disciples of Christ in our homes, community and beyond.'
    ),
    'established': '1998',
    'diocese': 'Catholic Diocese of Osogbo',
    'parish_priest': '',
    'location': 'Ofatedo, Osun State, Nigeria',
}


class AboutPage(models.Model):
    """Content of the public About page. There is only ever one row (pk=1)."""

    SINGLETON_PK = 1

    # Hero section
    hero_title = models.CharField(max_length=150)
    hero_subtitle = models.CharField(max_length=300, blank=True)
    hero_image = models.ImageField(upload_to='about/', blank=True, null=True)

    # Main content. All text fields are plain text; line breaks are kept.
    description = models.TextField(blank=True)
    main_image = models.ImageField(upload_to='about/', blank=True, null=True)

    # Mission & vision
    mission = models.TextField(blank=True)
    vision = models.TextField(blank=True)

    # Parish information
    established = models.CharField(
        max_length=4,
        blank=True,
        validators=[RegexValidator(r'^\d{4}$', 'Enter a four-digit year.')],
    )
    diocese = models.CharField(max_length=150, blank=True)
    parish_priest = models.CharField(max_length=150, blank=True)
    location = models.CharField(max_length=200, blank=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'About page'
        verbose_name_plural = 'About page'

    def __str__(self):
        return 'About page'

    def save(self, *args, **kwargs):
        self.pk = self.SINGLETON_PK
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=cls.SINGLETON_PK, defaults=DEFAULT_CONTENT)
        return obj
