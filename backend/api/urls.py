from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from .views import UserProfileView

router = DefaultRouter()
router.register(r'users', views.UserListView, basename='user')

urlpatterns = [
    path('register/', views.register, name='register'),  # Đường dẫn cho đăng ký
    path('login/', views.login, name='login'),  # Đường dẫn cho đăng nhập
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('', include(router.urls)),  # Bao gồm tất cả các đường dẫn từ router
]
