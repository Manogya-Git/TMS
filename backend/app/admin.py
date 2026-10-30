from django.contrib import admin

from .models import (
    Category,
    DeviceToken,
    Ticket,
    Comment,
    Attachment,
    Notification
)


admin.site.register(Category)
admin.site.register(Ticket)
admin.site.register(Comment)
admin.site.register(Attachment)
admin.site.register(Notification)
admin.site.register(DeviceToken)