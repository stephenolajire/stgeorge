from django.core.exceptions import ValidationError
from django.utils.deconstruct import deconstructible
from django.core.validators import FileExtensionValidator

MAX_PHOTO_SIZE = 2 * 1024 * 1024  # 2 MB

validate_photo_extension = FileExtensionValidator(['jpg', 'jpeg', 'png'], 'Upload a JPG or PNG image.')


@deconstructible
class MaxFileSizeValidator:
    """Rejects files bigger than the given number of megabytes."""

    def __init__(self, megabytes):
        self.megabytes = megabytes

    def __call__(self, file):
        if file.size > self.megabytes * 1024 * 1024:
            raise ValidationError(f'The image must be {self.megabytes} MB or smaller.')

    def __eq__(self, other):
        return isinstance(other, MaxFileSizeValidator) and other.megabytes == self.megabytes


def validate_photo_size(file):
    if file.size > MAX_PHOTO_SIZE:
        raise ValidationError('The photo must be 2 MB or smaller.')
