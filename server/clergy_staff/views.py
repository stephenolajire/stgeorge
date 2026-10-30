from django.db import transaction
from django.db.models import Count, Q
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response

from core.permissions import IsAdminOrReadOnly

from .models import ROLE_CATEGORY, Member, Role

# The "Priests of Our Parish" section on the public About page, in display order.
LEADERSHIP_ROLES = [Role.PARISH_PRIEST, Role.BISHOP, Role.ASSISTANT_PARISH_PRIEST]
from .serializers import MemberSerializer, ReorderSerializer


class MemberPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class MemberViewSet(viewsets.ModelViewSet):
    """
    Clergy & staff.

    GET    /api/clergy-staff/            list (paginated, 10 per page)
           ?category=clergy|religious|staff  ?role=<role>  ?status=active|inactive  ?search=<text>
    POST   /api/clergy-staff/            create (staff only; send the photo as multipart form data)
    GET    /api/clergy-staff/<id>/       one member
    PATCH  /api/clergy-staff/<id>/       update (staff only; remove_photo=true clears the photo)
    DELETE /api/clergy-staff/<id>/       delete (staff only)
    GET    /api/clergy-staff/summary/    counts per tab and the list of roles (staff only)
    POST   /api/clergy-staff/reorder/    {ids: [...]} in the new display order (staff only)
    GET    /api/clergy-staff/leadership/ parish priest, bishop, assistant parish priest (public)

    The public only sees active members.
    """

    serializer_class = MemberSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = MemberPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['full_name', 'short_bio', 'email', 'phone']
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        queryset = Member.objects.all()
        params = self.request.query_params

        # The public only ever sees active members; staff can filter by status.
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_active=True)

        if category := params.get('category'):
            queryset = queryset.filter(category=category)
        if role := params.get('role'):
            queryset = queryset.filter(role=role)
        status_filter = params.get('status')
        if status_filter == 'active':
            queryset = queryset.filter(is_active=True)
        elif status_filter == 'inactive':
            queryset = queryset.filter(is_active=False)
        return queryset

    def perform_destroy(self, instance):
        photo = instance.photo.name if instance.photo else None
        instance.delete()
        if photo:
            Member._meta.get_field('photo').storage.delete(photo)

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def summary(self, request):
        counts = Member.objects.aggregate(
            all=Count('id'),
            clergy=Count('id', filter=Q(category='clergy')),
            religious=Count('id', filter=Q(category='religious')),
            staff=Count('id', filter=Q(category='staff')),
            inactive=Count('id', filter=Q(is_active=False)),
        )
        roles = [{'value': r.value, 'label': r.label, 'category': ROLE_CATEGORY[r].value} for r in Role]
        return Response({'counts': counts, 'roles': roles})

    @action(detail=False, methods=['get'], permission_classes=[AllowAny], pagination_class=None)
    def leadership(self, request):
        """The first active member in each leadership role, in LEADERSHIP_ROLES order. Missing roles are skipped."""
        active = Member.objects.filter(is_active=True, role__in=LEADERSHIP_ROLES).order_by('order', 'id')
        first_by_role = {}
        for member in active:
            first_by_role.setdefault(member.role, member)
        leaders = [first_by_role[role] for role in LEADERSHIP_ROLES if role in first_by_role]
        return Response(self.get_serializer(leaders, many=True).data)

    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def reorder(self, request):
        """Put the given members in the given order, reusing the positions they already hold."""
        serializer = ReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ids = serializer.validated_data['ids']

        with transaction.atomic():
            members = {m.id: m for m in Member.objects.select_for_update().filter(id__in=ids)}
            if len(set(ids)) != len(ids) or len(members) != len(ids):
                return Response({'ids': ['Unknown or duplicate member ids.']}, status=status.HTTP_400_BAD_REQUEST)
            positions = sorted(m.order for m in members.values())
            for member_id, position in zip(ids, positions):
                members[member_id].order = position
            Member.objects.bulk_update(members.values(), ['order'])
        return Response(status=status.HTTP_204_NO_CONTENT)
