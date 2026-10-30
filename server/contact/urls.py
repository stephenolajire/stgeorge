from django.urls import path
from rest_framework.routers import SimpleRouter

from .api import ContactMessageViewSet, ContactPageViewSet, FAQViewSet

router = SimpleRouter()
router.register('contact/messages', ContactMessageViewSet, basename='contact-messages')
router.register('contact/faqs', FAQViewSet, basename='contact-faqs')

page = ContactPageViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update'})

urlpatterns = [path('contact/page/', page, name='contact-page'), *router.urls]
