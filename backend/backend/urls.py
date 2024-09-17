from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from api import views
from django.conf import settings
from django.conf.urls.static import static
from api.views import WishlistToggleView, WishlistStatusView, WishlistListView, upload_product_images, ResetPasswordView

router = routers.DefaultRouter()
router.register(r'products', views.ProductListView, basename='product')
router.register(r'categories', views.CategoryListView, basename='category')
router.register(r'cart', views.CartItemView, basename='cart')
router.register(r'addresses', views.AddressView, basename='address')
router.register(r'orders', views.OrderView, basename='order')
router.register(r'reviews', views.ReviewView, basename='reviews')



urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),  # Đường dẫn cho các API viewsets
    path('auth/', include('api.urls')),  # Đường dẫn cho các API xác thực và người dùng
    path('wishlist/<int:product_id>/toggle/', WishlistToggleView.as_view(), name='wishlist-toggle'),  # Wishlist toggle URL
    path('wishlist/<int:product_id>/', WishlistStatusView.as_view(), name='wishlist-status'),  # Wishlist status URL
    path('wishlist/', WishlistListView.as_view(), name='wishlist-list'),
    path('products/<int:product_id>/upload_images/', upload_product_images, name='upload_product_images'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('check-transaction/', views.check_transaction, name='check_transaction'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    
    # Đường dẫn cho danh sách sản phẩm
    path('products/', views.product_list_view, name='product_list'),

    # Đường dẫn cho trang chỉnh sửa sản phẩm
    path('products/edit/<int:product_id>/<int:variant_id>/', views.edit_product, name='edit_product'),
    # Đường dẫn cho danh sách danh mục
    path('categories/', views.category_list_view, name='category_list'),

    # Đường dẫn cho trang chỉnh sửa danh mục
    path('categories/edit/<int:category_id>/', views.edit_category, name='edit_category'),

    # Đường dẫn cho danh sách đơn hàng
    path('orders/', views.order_list_view, name='order_list'),

    # Đường dẫn cho danh sách người dùng
    path('users/', views.user_list_view, name='user_list'),
]

# Serve media files during development
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
