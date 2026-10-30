# accounts/urls.py
from django.urls import path
from .views import RegisterView,MeView,AgentListView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("me/", MeView.as_view(), name="me"),
    path("agent/", AgentListView.as_view(), name="agent"),
]
