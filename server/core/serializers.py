class ImageFieldsMixin:
    """
    For serializers with image fields. Multipart forms cannot send "null" for a file, so each
    image field `x` is cleared with a write-only `remove_x=true` flag (declare it on the serializer).
    Replaced or removed files are deleted from storage.
    """

    image_fields = ('image',)

    def create(self, validated_data):
        for field in self.image_fields:
            validated_data.pop(f'remove_{field}', None)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        old_files = {}
        for field in self.image_fields:
            remove = validated_data.pop(f'remove_{field}', False)
            current = getattr(instance, field)
            if (remove or field in validated_data) and current:
                old_files[field] = current.name
            if remove and field not in validated_data:
                setattr(instance, field, None)

        instance = super().update(instance, validated_data)

        for field, name in old_files.items():
            if getattr(instance, field).name != name:
                instance._meta.get_field(field).storage.delete(name)
        return instance
