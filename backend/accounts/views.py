from django.shortcuts import render
from .serializer import RegistrationSerializer,UserSerializer
from rest_framework import generics 
from rest_framework import permissions
from rest_framework.permissions import IsAuthenticated
from .models import User

# Create your views here.
class RegisterView(generics.CreateAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.AllowAny]

class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permissions_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class AgentListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permissions_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != "admin":
            return User.objects.none()
        return User.objects.filter(role="agent")

