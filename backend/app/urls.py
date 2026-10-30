from django.urls import path, include
from rest_framework.routers import DefaultRouter


from .views import (
    TicketViewSet,
    CategoryListView,
    TicketAttachmentView,
    CommentListCreateView,
    CommentDetailView,
    NotificationListView,
    NotificationDetailView,
    RegisterDeviceTokenView,
)


router = DefaultRouter()

router.register("tickets", TicketViewSet, basename="ticket")

urlpatterns = [
    path("", include(router.urls)),
    path("categories/",CategoryListView.as_view(),name='category-list'),
    path("tickets/<int:ticket_id>/attachments/",TicketAttachmentView.as_view(),name="ticket-attachments"),
    path("tickets/<int:ticket_id>/comments/",CommentListCreateView.as_view(),name="ticket-comments"),
    path("tickets/<int:ticket_id>/comments/<int:pk>/",CommentDetailView.as_view(), name="ticket-comment-detail"),
    path("notifications/", NotificationListView.as_view(), name="notification-list"),
    path("notifications/<int:pk>/", NotificationDetailView.as_view(), name="notification-detail"),
    path("notifications/register-device/", RegisterDeviceTokenView.as_view(), name="register-device"),
    
    
]