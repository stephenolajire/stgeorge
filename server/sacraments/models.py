from django.db import models

from core.choices import CardIcon
from core.models import OrderedModel
from core.validators import MaxFileSizeValidator, validate_photo_extension

IMAGE_VALIDATORS = [validate_photo_extension, MaxFileSizeValidator(5)]


class SacramentIcon(models.TextChoices):
    """Symbol in the round badge on a sacrament's card. Keys match frontend/src/utils/sacramentIcons.ts."""

    WATER = 'water', 'Water'
    FIRE = 'fire', 'Fire'
    CHALICE = 'chalice', 'Chalice'
    HANDS = 'hands', 'Hands'
    OIL = 'oil', 'Oil'
    CROSS = 'cross', 'Cross'
    RINGS = 'rings', 'Rings'
    DOVE = 'dove', 'Dove'


class Sacrament(OrderedModel):
    """One sacrament shown on the website, e.g. Baptism."""

    title = models.CharField(max_length=120)
    icon = models.CharField(max_length=20, choices=SacramentIcon.choices, default=SacramentIcon.CROSS)
    short_description = models.CharField(max_length=300)
    # Plain text; a blank line starts a new paragraph. Shown when a visitor clicks "Learn More".
    content = models.TextField()
    image = models.ImageField(upload_to='sacraments/', blank=True, null=True, validators=IMAGE_VALIDATORS)
    is_published = models.BooleanField('published', default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta(OrderedModel.Meta):
        pass

    def __str__(self):
        return self.title


DEFAULT_PAGE = {
    'hero_title': 'The Sacraments',
    'hero_subtitle': "Visible signs of God's grace, instituted by Christ, to give us His divine life.",
    'intro_title': 'Encounters with Christ',
    'intro_text': (
        'The Sacraments are special signs given to us by Christ through the Church. They are visible signs '
        "of invisible grace, helping us to grow in faith, receive God's life, and journey towards eternal life."
    ),
    'quote_text': 'The sacraments are the channels through which Christ pours out the grace of the Holy Spirit.',
    'quote_source': 'Catechism of the Catholic Church',
    'list_title': 'Discover the Sacraments',
    'list_subtitle': 'The Church celebrates seven sacraments, which touch all the stages and important moments of Christian life.',
    'cta_title': 'Receive the Sacraments',
    'cta_text': 'We are here to guide and support you on your sacramental journey.',
}


class SacramentsPage(models.Model):
    """Text and images of the public Sacraments page. There is only ever one row (pk=1)."""

    SINGLETON_PK = 1

    # Banner
    hero_title = models.CharField(max_length=150)
    hero_subtitle = models.CharField(max_length=300, blank=True)
    hero_image = models.ImageField(upload_to='sacraments/', blank=True, null=True, validators=IMAGE_VALIDATORS)

    # "About the Sacraments" block, with a quote beside it
    intro_title = models.CharField(max_length=150, blank=True)
    intro_text = models.TextField(blank=True)
    quote_text = models.CharField(max_length=400, blank=True)
    quote_source = models.CharField(max_length=150, blank=True)

    # Heading above the sacrament cards
    list_title = models.CharField(max_length=150, blank=True)
    list_subtitle = models.CharField(max_length=300, blank=True)

    # Banner at the bottom ("Receive the Sacraments")
    cta_title = models.CharField('call-to-action title', max_length=150, blank=True)
    cta_text = models.CharField('call-to-action text', max_length=300, blank=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Sacraments page'
        verbose_name_plural = 'Sacraments page'

    def __str__(self):
        return 'Sacraments page'

    def save(self, *args, **kwargs):
        self.pk = self.SINGLETON_PK
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=cls.SINGLETON_PK, defaults=DEFAULT_PAGE)
        return obj

    def get_features(self):
        return SacramentFeature.objects.all()


class SacramentFeature(OrderedModel):
    """A card in the strip under the sacraments, e.g. "Scripture Foundation"."""

    title = models.CharField(max_length=60)
    text = models.CharField(max_length=160)
    icon = models.CharField(max_length=20, choices=CardIcon.choices, default=CardIcon.BOOK)

    class Meta(OrderedModel.Meta):
        pass

    def __str__(self):
        return self.title
