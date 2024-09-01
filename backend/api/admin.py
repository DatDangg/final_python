from django.contrib import admin
from .models import Product, Category, WishlistItem, CartItem, Address

class ProductAdmin(admin.ModelAdmin):
    list_display = ("title", "brand", "images", "description", "cost_price", "listed_price", "SKU", "quantity", "category")
    list_filter = ("category",)  # Optional: Adds a filter sidebar for categories
    search_fields = ("title", "brand", "category__name")  # Optional: Allows searching by category name

class CategoryAdmin(admin.ModelAdmin):  # Corrected typo in class name
    list_display = ("name", "image")

class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'added_at')  # Các trường bạn muốn hiển thị trong danh sách
    list_filter = ('user', 'product')  # Các trường bạn muốn lọc
    search_fields = ('user__username', 'product__title')  # Các trường tìm kiếm

class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'quantity')  # Customize as per your Cart model fields
    search_fields = ('user__username', 'product__name')  # Enable search by related user and product fields

class AddressAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'specific_address', 'phone_number', 'address_type')
    search_fields = ('full_name', 'specific_address', 'phone_number')

admin.site.register(Product, ProductAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(WishlistItem, WishlistItemAdmin)
admin.site.register(CartItem, CartAdmin)
admin.site.register(Address, AddressAdmin)
