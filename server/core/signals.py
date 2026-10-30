from django.dispatch import Signal

# Sent (with sender=<model class>) after rows were changed in bulk, e.g. by bulk_update,
# which does not fire post_save. The realtime app listens to announce the change.
bulk_changed = Signal()
