from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings

# Create your models here.
class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        AGENT = "agent","Agent"
        CUSTOMER = "customer","Customer"
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER)