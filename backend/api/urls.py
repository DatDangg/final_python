from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from .views import UserProfileView

router = DefaultRouter()
router.register(r'users', views.UserListView, basename='user')

urlpatterns = [
    path('register/', views.register, name='register'),  
    path('login/', views.login, name='login'),  
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('', include(router.urls)),  
]
