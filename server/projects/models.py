from django.core.validators import MaxValueValidator
from django.db import models

from core.validators import MaxFileSizeValidator, validate_photo_extension


class ProjectStatus(models.TextChoices):
    ONGOING = 'ongoing', 'Ongoing'
    COMPLETED = 'completed', 'Completed'
    UPCOMING = 'upcoming', 'Upcoming'


class ProjectCategory(models.TextChoices):
    BUILDING = 'building', 'Building & Construction'
    INFRASTRUCTURE = 'infrastructure', 'Infrastructure'
    WATER = 'water', 'Water & Sanitation'
    ENERGY = 'energy', 'Energy'
    EDUCATION = 'education', 'Education & Formation'
    SECURITY = 'security', 'Security'
    WELFARE = 'welfare', 'Health & Welfare'
    OTHER = 'other', 'Other'


class Project(models.Model):
    """A parish project or development initiative, e.g. "Church Building Expansion"."""

    title = models.CharField(max_length=150)
    category = models.CharField(max_length=20, choices=ProjectCategory.choices, default=ProjectCategory.BUILDING)
    status = models.CharField(max_length=20, choices=ProjectStatus.choices, default=ProjectStatus.ONGOING, db_index=True)
    short_description = models.CharField(max_length=300)
    # Plain text; a blank line starts a new paragraph.
    content = models.TextField('full description', blank=True)
    image = models.ImageField(upload_to='projects/', blank=True, null=True, validators=[validate_photo_extension, MaxFileSizeValidator(5)])
    # How far along it is, 0-100. Completed projects are always 100.
    progress = models.PositiveSmallIntegerField(default=0, validators=[MaxValueValidator(100)])
    # Whole naira.
    target_amount = models.PositiveBigIntegerField(blank=True, null=True)
    target_date = models.DateField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = [models.F('target_date').desc(nulls_last=True), '-id']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.status == ProjectStatus.COMPLETED:
            self.progress = 100
        super().save(*args, **kwargs)


class ProjectsPage(models.Model):
    """Banner of the public Projects page. There is only ever one row (pk=1)."""

    SINGLETON_PK = 1

    hero_title = models.CharField(max_length=150, default='Building a Stronger Parish')
    hero_subtitle = models.CharField(
        max_length=300,
        blank=True,
        default='Explore our ongoing and upcoming projects. Together, we can continue to build a vibrant parish '
        'for worship, service and community growth.',
    )
    hero_image = models.ImageField(upload_to='projects/', blank=True, null=True, validators=[validate_photo_extension, MaxFileSizeValidator(5)])
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Projects page'
        verbose_name_plural = 'Projects page'

    def __str__(self):
        return 'Projects page'

    def save(self, *args, **kwargs):
        self.pk = self.SINGLETON_PK
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=cls.SINGLETON_PK)
        return obj
