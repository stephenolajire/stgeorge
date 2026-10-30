from django.db import models

from core.validators import MaxFileSizeValidator, validate_photo_extension


class Section(models.Model):
    """One section of the public Parish Life page, e.g. "Worship & Liturgy"."""

    title = models.CharField(max_length=150)
    short_description = models.CharField(max_length=300)
    # Plain text; a blank line starts a new paragraph.
    content = models.TextField()
    image = models.ImageField(
        upload_to='parish_life/',
        blank=True,
        null=True,
        validators=[validate_photo_extension, MaxFileSizeValidator(5)],
    )
    is_published = models.BooleanField('published', default=True)
    # Position on the page; lower comes first.
    order = models.PositiveIntegerField(default=0, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'parish life section'

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self._state.adding and not self.order:
            # New sections go to the end of the page.
            last = Section.objects.aggregate(models.Max('order'))['order__max']
            self.order = (last or 0) + 1
        super().save(*args, **kwargs)
