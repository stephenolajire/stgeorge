from django.db import models


class OrderedModel(models.Model):
    """A model shown in a user-defined order. New rows go to the end."""

    # Position on the website; lower comes first.
    order = models.PositiveIntegerField(default=0, db_index=True)

    class Meta:
        abstract = True
        ordering = ['order', 'id']

    def save(self, *args, **kwargs):
        if self._state.adding and not self.order:
            last = type(self).objects.aggregate(models.Max('order'))['order__max']
            self.order = (last or 0) + 1
        super().save(*args, **kwargs)
