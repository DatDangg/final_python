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
    path('change-password/', views.change_password, name='change_password'),
    path('api/', include(router.urls)),  
    path('auth/', include('api.urls')),  
    path('reviews/order/<int:order_id>/', views.get_reviews_by_order, name='get-reviews-by-order'),
    path('wishlist/<int:product_id>/toggle/', WishlistToggleView.as_view(), name='wishlist-toggle'), 
    path('wishlist/<int:product_id>/', WishlistStatusView.as_view(), name='wishlist-status'),  
    path('wishlist/', WishlistListView.as_view(), name='wishlist-list'),
    path('products/<int:product_id>/upload_images/', upload_product_images, name='upload_product_images'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('check-transaction/', views.check_transaction, name='check_transaction'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('products/', views.product_list_view, name='product_list'),
    path('products/edit/<int:product_id>/<int:variant_id>/', views.edit_product, name='edit_product'),
    path('categories/', views.category_list_view, name='category_list'),
    path('categories/edit/<int:category_id>/', views.edit_category, name='edit_category'),
    path('orders/', views.order_list_view, name='order_list'),
    path('users/', views.user_list_view, name='user_list'),
    path('add-product/', views.add_product_view, name='add_product'),
    path('add-category/', views.add_category_view, name='add_category'),
    path('delete-product/<int:product_id>/', views.delete_product_view, name='delete_product'), 
    path('delete-category/<int:category_id>/', views.delete_category_view, name='delete_category'), 
    path('orders/<int:order_id>/cancel/', views.cancel_order, name='cancel_order'),
    path('best-selling-products/', views.best_selling_products, name='best-selling-products'),
    path('discounted-products/', views.discounted_products, name='discounted-products'),
    path('brands/', views.brand_list, name='brand-list'),
    path('products/suggestions/', views.product_suggestions, name='product-suggestions'),
    path('check-username-email/', views.check_username_email, name='check_username_email'),
]

# Serve media files during development
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
