from rest_framework import mixins, viewsets
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser

from .models import AboutPage
from core.permissions import IsAdminOrReadOnly
from .serializers import AboutPageSerializer


class AboutPageViewSet(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """
    The About page is a single record, so there is no list/create/delete and no id in the URL.

    GET   /api/about/  read the content (public)
    PATCH /api/about/  update some fields (staff only); send images as multipart form data

    All text is plain text. Any HTML sent is stripped before saving.
    """

    serializer_class = AboutPageSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_object(self):
        obj = AboutPage.load()
        self.check_object_permissions(self.request, obj)
        return obj
