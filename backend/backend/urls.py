from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from api import views
from django.conf import settings
from django.conf.urls.static import static

router = routers.DefaultRouter()
router.register(r'products', views.APiListView, basename='product')
router.register(r'categories', views.CategoryListView, basename='category')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),  # Đường dẫn cho các API viewsets
    path('auth/', include('api.urls')),  # Đường dẫn cho các API xác thực và người dùng
]

# Serve media files during development
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
