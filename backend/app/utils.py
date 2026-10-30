from venv import logger

from .models import Ticket,Notification, DeviceToken
from .firebase import send_push_notification
from django.core.mail import send_mail
from django.conf import settings
import logging

def get_scoped_tickets(user):
    if user.role == "admin":
        return Ticket.objects.all()

    if user.role == "agent":
        return Ticket.objects.filter(assigned_to=user)
    return Ticket.objects.filter(created_by=user)

def notify(recipient,actor,ticket,verb,message):
    if recipient is None or recipient == actor:
        return 
    Notification.objects.create(
        recipient=recipient,
        actor=actor,
        ticket=ticket,
        verb=verb,
        message=message,

    )

    tokens = DeviceToken.objects.filter(user=recipient).values_list("token",flat=True)
    for token in tokens:
        send_push_notification(
            token=token,
            title="TMS Notification",
            body=message,
            data={"ticket_id": str(ticket.id)},
        )
    if recipient.email:
        try:
            send_mail(
                subject=f"TMS Notification",
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient.email],
                fail_silently=False,
            )
        except Exception:
            logger.exception(f"Failed to send email notification to {recipient.email}")

