from django.conf import settings
from django.db import models

from core.models import OrderedModel
from core.validators import MaxFileSizeValidator, validate_photo_extension

IMAGE_VALIDATORS = [validate_photo_extension, MaxFileSizeValidator(5)]


class Subject(models.TextChoices):
    GENERAL = 'general', 'General Inquiry'
    MASS_TIMES = 'mass_times', 'Mass Times'
    SACRAMENTS = 'sacraments', 'Sacraments'
    MASS_INTENTION = 'mass_intention', 'Mass Intention'
    MEMBERSHIP = 'membership', 'Parish Membership'
    VOLUNTEERING = 'volunteering', 'Volunteering & Parish Groups'
    EVENTS = 'events', 'Parish Events'
    OTHER = 'other', 'Other'


class Status(models.TextChoices):
    UNREAD = 'unread', 'Unread'
    READ = 'read', 'Read'
    REPLIED = 'replied', 'Replied'
    ARCHIVED = 'archived', 'Archived'


class ContactMessage(models.Model):
    """A message sent through the website's contact form."""

    name = models.CharField(max_length=120)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True)
    subject = models.CharField(max_length=30, choices=Subject.choices, default=Subject.GENERAL)
    message = models.TextField(max_length=5000)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.UNREAD, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    replied_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at', '-id']

    def __str__(self):
        return f'{self.name}: {self.get_subject_display()}'


class ContactReply(models.Model):
    """A reply an administrator emailed to the sender of a message."""

    message = models.ForeignKey(ContactMessage, on_delete=models.CASCADE, related_name='replies')
    subject = models.CharField(max_length=200)
    body = models.TextField()
    sent_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['sent_at']
        verbose_name_plural = 'contact replies'


DEFAULT_PAGE = {
    'hero_title': 'Contact Us',
    'hero_subtitle': 'We would love to hear from you. Get in touch with us for inquiries, support or to learn more about our parish.',
    'address': 'St. George Catholic Church, Ofatedo, Osun State, Nigeria.',
    'phone': '',
    'phone_hours': 'Mon - Sun: 8:00 AM - 6:00 PM',
    'email': 'stgeorgeofatedo@gmail.com',
    'email_note': 'We respond as soon as possible.',
    'office_days': 'Monday - Sunday',
    'office_hours': '8:00 AM - 6:00 PM',
    'form_title': 'Get in Touch',
    'form_subtitle': 'Fill out the form below and we will get back to you soon.',
    'map_title': 'Our Location',
    'map_subtitle': 'Visit us at St. George Catholic Church, Ofatedo. All are welcome.',
    'map_query': 'St. George Catholic Church, Ofatedo, Osun State, Nigeria',
    'directions': 'Located along the Ofatedo road, easily accessible from Osogbo. Use the map above to get directions to the church.',
    'faq_title': 'Quick Questions',
    'faq_subtitle': 'Here are some quick answers to common questions.',
    'banner_title': 'A Church Family Always Ready to Listen',
    'banner_quote': "Bear one another's burdens, and so fulfil the law of Christ.",
    'banner_quote_source': 'Galatians 6:2',
}


class ContactPage(models.Model):
    """Text, contact details and images of the public Contact page. One row (pk=1).

    The address, phone, email and hours are also used in the website footer and in email footers.
    """

    SINGLETON_PK = 1

    hero_title = models.CharField(max_length=150)
    hero_subtitle = models.CharField(max_length=300, blank=True)
    hero_image = models.ImageField(upload_to='contact/', blank=True, null=True, validators=IMAGE_VALIDATORS)

    # Contact details (info cards, footer, emails)
    address = models.CharField(max_length=250, blank=True)
    phone = models.CharField(max_length=40, blank=True)
    phone_hours = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    email_note = models.CharField(max_length=150, blank=True)
    office_days = models.CharField(max_length=100, blank=True)
    office_hours = models.CharField(max_length=100, blank=True)

    # Form and map
    form_title = models.CharField(max_length=150, blank=True)
    form_subtitle = models.CharField(max_length=300, blank=True)
    map_title = models.CharField(max_length=150, blank=True)
    map_subtitle = models.CharField(max_length=300, blank=True)
    map_query = models.CharField('map search', max_length=250, blank=True, help_text='What the map searches for, e.g. the church name and town.')
    directions = models.TextField(blank=True)

    # Questions and the side banner
    faq_title = models.CharField(max_length=150, blank=True)
    faq_subtitle = models.CharField(max_length=300, blank=True)
    banner_title = models.CharField(max_length=150, blank=True)
    banner_quote = models.CharField(max_length=300, blank=True)
    banner_quote_source = models.CharField(max_length=100, blank=True)
    banner_image = models.ImageField(upload_to='contact/', blank=True, null=True, validators=IMAGE_VALIDATORS)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Contact page'
        verbose_name_plural = 'Contact page'

    def __str__(self):
        return 'Contact page'

    def save(self, *args, **kwargs):
        self.pk = self.SINGLETON_PK
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=cls.SINGLETON_PK, defaults=DEFAULT_PAGE)
        return obj

    def get_faqs(self):
        return FAQ.objects.all()


class FAQ(OrderedModel):
    """A question and answer in the "Quick Questions" list."""

    question = models.CharField(max_length=200)
    answer = models.TextField()

    class Meta(OrderedModel.Meta):
        verbose_name = 'FAQ'
        verbose_name_plural = 'FAQs'

    def __str__(self):
        return self.question
