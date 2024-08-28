from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from api import views
from django.conf import settings
from django.conf.urls.static import static
from api.views import WishlistToggleView, WishlistStatusView, WishlistListView, CartItemView

router = routers.DefaultRouter()
router.register(r'products', views.ProductListView, basename='product')
router.register(r'categories', views.CategoryListView, basename='category')
router.register(r'cart', views.CartItemView, basename='cart')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),  # Đường dẫn cho các API viewsets
    path('auth/', include('api.urls')),  # Đường dẫn cho các API xác thực và người dùng
    path('wishlist/<int:product_id>/toggle/', WishlistToggleView.as_view(), name='wishlist-toggle'),  # Wishlist toggle URL
    path('wishlist/<int:product_id>/', WishlistStatusView.as_view(), name='wishlist-status'),  # Wishlist status URL
    path('wishlist/', WishlistListView.as_view(), name='wishlist-list'),
]

# Serve media files during development
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
