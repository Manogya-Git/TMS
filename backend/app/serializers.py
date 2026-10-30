from rest_framework import serializers
from .models import (
    Ticket,
    Category,
    Comment,
    Attachment,
    Notification,
    DeviceToken

)


class TicketSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True, default=None)
    assigned_to_username = serializers.CharField(source="assigned_to.username", read_only=True, default=None)
    created_by_username = serializers.CharField(source="created_by.username", read_only=True, default=None)

    class Meta:
        model = Ticket
        fields = [
            "id", "title", "description", "status", "priority",
            "category", "category_name",
            "assigned_to", "assigned_to_username",
            "created_by", "created_by_username",
            "created_at", "updated_at", "resolved_at",
        ]
        read_only_fields = ["created_by", "created_at", "updated_at", "resolved_at"]

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class CommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username",read_only=True)
    class Meta:
        model = Comment
        fields = "__all__"
        read_only_fields = ["id", "ticket", "user", "created_at", "updated_at"]


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ["id","ticket","uploaded_by","file","uploaded_at"]
        read_only_fields = ["uploaded_by","uploaded_at","ticket"]


class NotificationSerializer(serializers.ModelSerializer):
    actor_username = serializers.CharField(source="actor.username",read_only=True)
    ticket_title = serializers.CharField(source="ticket.title",read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id",
            "actor",
            "actor_username",
            "ticket",
            "ticket_title",
            "verb",
            "message",
            "is_read",
            "created_at",
        ]
        read_only_fields = ["id", "actor", "ticket", "verb", "message", "created_at"]

class DeviceTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceToken
        fields = ["id","token"]
        extra_kwargs = {
            "token": {"validators": []}
        }



