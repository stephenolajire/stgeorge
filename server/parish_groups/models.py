from django.db import models

from core.models import OrderedModel
from core.validators import MaxFileSizeValidator, validate_photo_extension


class ParishGroup(OrderedModel):
    """A parish group or society, e.g. Altar Servers, Choir, CWO."""

    name = models.CharField(max_length=120)
    description = models.CharField(max_length=300, help_text='One or two sentences shown on the card.')
    image = models.ImageField(
        upload_to='parish_groups/',
        blank=True,
        null=True,
        validators=[validate_photo_extension, MaxFileSizeValidator(5)],
    )
    is_active = models.BooleanField('active', default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta(OrderedModel.Meta):
        pass

    def __str__(self):
        return self.name
