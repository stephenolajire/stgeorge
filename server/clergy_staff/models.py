from django.db import models
from core.validators import validate_photo_extension, validate_photo_size

class Category(models.TextChoices):
    CLERGY = 'clergy', 'Clergy'
    RELIGIOUS = 'religious', 'Religious'
    STAFF = 'staff', 'Staff'


class Role(models.TextChoices):
    PARISH_PRIEST = 'parish_priest', 'Parish Priest'
    ASSISTANT_PARISH_PRIEST = 'assistant_parish_priest', 'Assistant Parish Priest'
    RESIDENT_PRIEST = 'resident_priest', 'Resident Priest'
    CHAPLAIN = 'chaplain', 'Chaplain'
    RELIGIOUS_SISTER = 'religious_sister', 'Religious Sister'
    RELIGIOUS_BROTHER = 'religious_brother', 'Religious Brother'
    PARISH_SECRETARY = 'parish_secretary', 'Parish Secretary'
    OFFICE_ADMINISTRATOR = 'office_administrator', 'Office Administrator'
    MAINTENANCE_OFFICER = 'maintenance_officer', 'Maintenance Officer'
    CHOIR_COORDINATOR = 'choir_coordinator', 'Choir Coordinator'
    CATECHIST = 'catechist', 'Catechist'
    OTHER_STAFF = 'other_staff', 'Other Staff'


# Each role belongs to one category, which drives the tabs and the role badge.
ROLE_CATEGORY = {
    Role.PARISH_PRIEST: Category.CLERGY,
    Role.ASSISTANT_PARISH_PRIEST: Category.CLERGY,
    Role.RESIDENT_PRIEST: Category.CLERGY,
    Role.CHAPLAIN: Category.CLERGY,
    Role.RELIGIOUS_SISTER: Category.RELIGIOUS,
    Role.RELIGIOUS_BROTHER: Category.RELIGIOUS,
    Role.PARISH_SECRETARY: Category.STAFF,
    Role.OFFICE_ADMINISTRATOR: Category.STAFF,
    Role.MAINTENANCE_OFFICER: Category.STAFF,
    Role.CHOIR_COORDINATOR: Category.STAFF,
    Role.CATECHIST: Category.STAFF,
    Role.OTHER_STAFF: Category.STAFF,
}


class Member(models.Model):
    """A member of the clergy, a religious, or a parish staff member."""

    full_name = models.CharField(max_length=150)
    role = models.CharField(max_length=40, choices=Role.choices)
    # Set from the role on save; stored so the list can be filtered by it.
    category = models.CharField(max_length=20, choices=Category.choices, editable=False, db_index=True)
    short_bio = models.CharField('short bio / position', max_length=255)
    description = models.TextField(blank=True)

    phone = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    photo = models.ImageField(
        upload_to='clergy_staff/',
        blank=True,
        null=True,
        validators=[validate_photo_extension, validate_photo_size],
    )

    is_active = models.BooleanField('active', default=True)
    # Display order on the website; lower comes first.
    order = models.PositiveIntegerField(default=0, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'clergy / staff member'
        verbose_name_plural = 'clergy & staff'

    def __str__(self):
        return self.full_name

    def save(self, *args, **kwargs):
        self.category = ROLE_CATEGORY[Role(self.role)]
        update_fields = kwargs.get('update_fields')
        if update_fields is not None and 'role' in update_fields:
            kwargs['update_fields'] = {*update_fields, 'category'}
        if self._state.adding and not self.order:
            # New members go to the end of the list.
            last = Member.objects.aggregate(models.Max('order'))['order__max']
            self.order = (last or 0) + 1
        super().save(*args, **kwargs)
