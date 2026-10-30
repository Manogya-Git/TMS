from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from rest_framework.exceptions import PermissionDenied, NotFound
from .utils import notify, get_scoped_tickets
from .models import DeviceToken, Notification
from .serializers import NotificationSerializer

from .models import (
    Ticket,
    Category,
    Comment,
    Attachment,
)

from .serializers import (
    TicketSerializer,
    CategorySerializer,
    CommentSerializer,
    AttachmentSerializer,
    DeviceTokenSerializer
)
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone


class TicketViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self, request):
        return get_scoped_tickets(request.user)

    def list(self, request):
        queryset = self.get_queryset(request)
        serializer = TicketSerializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        queryset = self.get_queryset(request)
        ticket = get_object_or_404(queryset, pk=pk)
        serializer = TicketSerializer(ticket)
        return Response(serializer.data)

    def create(self, request):
        serializer = TicketSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        queryset = self.get_queryset(request)
        ticket = get_object_or_404(queryset, pk=pk)

        old_assigned = ticket.assigned_to_id
        old_status = ticket.status

        serializer = TicketSerializer(ticket, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            ticket.refresh_from_db()

            if old_assigned != ticket.assigned_to_id and ticket.assigned_to_id:
                notify(
                    recipient=ticket.assigned_to,
                    actor=request.user,
                    ticket=ticket,
                    verb="assigned",
                    message=f"{request.user.username} assigned you to \"{ticket.title}\"",
                )

            if old_status != "CLOSED" and ticket.status == "CLOSED":
                notify(
                    recipient=ticket.created_by,
                    actor=request.user,
                    ticket = ticket,
                    verb="closed",
                    message=f"your ticket \"{ticket.title}\" has been closed",
                )

            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        queryset = self.get_queryset(request)
        ticket = get_object_or_404(queryset, pk=pk)

        old_assigned = ticket.assigned_to_id
        old_status = ticket.status

        serializer = TicketSerializer(ticket, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            ticket.refresh_from_db()

            if ticket.status == "CLOSED" and ticket.resolved_at is None:
                ticket.resolved_at = timezone.now()
                ticket.save(update_fields=["resolved_at"])

            if old_assigned != ticket.assigned_to_id and ticket.assigned_to_id:
                notify(
                    recipient=ticket.assigned_to,
                    actor=request.user,
                    ticket=ticket,
                    verb="assigned",
                    message=f"{request.user.username} assigned you to \"{ticket.title}\"",
                )

            if old_status !="CLOSED" and ticket.status == "CLOSED":
                notify(
                recipient=ticket.created_by,
                actor=request.user,
                ticket=ticket,
                verb="closed",
                message=f"Your ticket \"{ticket.title}\" has been closed",

                )

            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        queryset = self.get_queryset(request)
        ticket = get_object_or_404(queryset, pk=pk)
        ticket.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class TicketAttachmentView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_ticket_for_user(self, request, ticket_id):
        user = request.user
        if user.role == "admin":
            queryset = Ticket.objects.all()
        elif user.role == "agent":
            queryset = Ticket.objects.filter(assigned_to=user)
        else:
            queryset = Ticket.objects.filter(created_by=user)
        return get_object_or_404(queryset, pk=ticket_id)

    def get(self, request, ticket_id):
        ticket = self.get_ticket_for_user(request, ticket_id)
        attachments = ticket.attachments.all()
        serializer = AttachmentSerializer(attachments, many=True)
        return Response(serializer.data)

    def post(self, request, ticket_id):
        ticket = self.get_ticket_for_user(request, ticket_id)
        serializer = AttachmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(ticket=ticket, uploaded_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, ticket_id):
        ticket = self.get_ticket_for_user(request, ticket_id)
        ticket.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_ticket(self):
        ticket_id = self.kwargs["ticket_id"]
        ticket = get_scoped_tickets(self.request.user).filter(id=ticket_id).first()
        if not ticket:
            raise NotFound("Ticket not found or you don't have access")
        return ticket

    def get_queryset(self):
        ticket = self.get_ticket()
        return Comment.objects.filter(ticket=ticket).order_by("created_at")

    def perform_create(self, serializer):
        ticket = self.get_ticket()
        comment = serializer.save(ticket=ticket, user=self.request.user)

        notify(
            recipient=ticket.created_by,
            actor=self.request.user,
            ticket=ticket,
            verb="commented",
            message=f"{self.request.user.username} commented on \"{ticket.title}\"",
        )

        if ticket.assigned_to and ticket.assigned_to != ticket.created_by:
            notify(
                recipient=ticket.assigned_to,
                actor=self.request.user,
                ticket=ticket,
                verb="commented",
                message=f"{self.request.user.username} commented on \"{ticket.title}\"",
            )


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        ticket_id = self.kwargs["ticket_id"]
        ticket = get_scoped_tickets(self.request.user).filter(id=ticket_id).first()

        if not ticket:
            raise NotFound("Ticket not found or you don't have access")
        return Comment.objects.filter(ticket=ticket)

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method in ("PUT", "PATCH", "DELETE"):
            if obj.user != request.user and request.user.role != "admin":
                raise PermissionDenied("You can only edit or delete your own comment")


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)


class NotificationDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

class RegisterDeviceTokenView(generics.CreateAPIView):
    serializer_class = DeviceTokenSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self,serializer):
        token = self.request.data.get("token")
        obj,created = DeviceToken.objects.get_or_create(
            token=token,
            defaults = {"user":self.request.user}
            
        )
        if not created and obj.user != self.request.user:
            obj.user = self.request.user
            obj.save(update_fields=["user"])
