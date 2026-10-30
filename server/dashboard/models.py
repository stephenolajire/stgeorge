from django.db import models


class PageVisit(models.Model):
    """
    One page view on the public website, for the dashboard's Website Overview.

    No IP address or cookie is kept: `visitor` is a hash of the visitor's IP address and browser
    with a secret that changes every day, so a person counts once per day and cannot be traced.
    """

    path = models.CharField(max_length=200)
    visitor = models.CharField(max_length=32, db_index=True)
    is_mobile = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.path
