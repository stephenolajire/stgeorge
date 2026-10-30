from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator

MAX_PHOTO_SIZE = 2 * 1024 * 1024  # 2 MB

validate_photo_extension = FileExtensionValidator(['jpg', 'jpeg', 'png'], 'Upload a JPG or PNG image.')


def validate_photo_size(file):
    if file.size > MAX_PHOTO_SIZE:
        raise ValidationError('The photo must be 2 MB or smaller.')
