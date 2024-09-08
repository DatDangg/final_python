from django.contrib import admin
from .models import Product, Category, WishlistItem, CartItem, Address, Order, OrderItem, ProductImage, PhoneDetail, ComputerDetail, HeadphoneDetail, ProductVariant, SmartwatchDetail

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class PhoneDetailInline(admin.StackedInline):
    model = PhoneDetail
    extra = 0

class ComputerDetailInline(admin.StackedInline):
    model = ComputerDetail
    extra = 0

class HeadphoneDetailInline(admin.StackedInline):
    model = HeadphoneDetail
    extra = 0

class SmartwatchDetailInline(admin.StackedInline):
    model = SmartwatchDetail
    extra = 0

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ['color', 'storage', 'cost_price', 'listed_price', 'quantity', 'SKU']

class ProductAdmin(admin.ModelAdmin):
    inlines = [ProductImageInline, ProductVariantInline]  # Hiển thị các biến thể và hình ảnh
    list_display = ("title", "brand", "image_count", "description", "category")
    list_filter = ("category",)
    search_fields = ("title", "brand", "category__name")

    def get_inline_instances(self, request, obj=None):
        inlines = []

        # Luôn hiển thị hình ảnh và biến thể sản phẩm
        inlines.append(ProductImageInline(self.model, self.admin_site))
        inlines.append(ProductVariantInline(self.model, self.admin_site))

        # Hiển thị thông tin chi tiết dựa trên loại sản phẩm
        if obj and obj.category.name == "Smart Phones":
            inlines.append(PhoneDetailInline(self.model, self.admin_site))
        elif obj and obj.category.name == "Computers":
            inlines.append(ComputerDetailInline(self.model, self.admin_site))
        elif obj and obj.category.name == "Headphones":
            inlines.append(HeadphoneDetailInline(self.model, self.admin_site))
        elif obj and obj.category.name == "Smart Watches":
            inlines.append(SmartwatchDetailInline(self.model, self.admin_site))

        return inlines  # Trả về danh sách các inlines đã được xây dựng

    def image_count(self, obj):
        return obj.images.count()

    image_count.short_description = 'Number of Images'



class CategoryAdmin(admin.ModelAdmin):  # Corrected typo in class name
    list_display = ("name", "image")

class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'added_at')  # Các trường bạn muốn hiển thị trong danh sách
    list_filter = ('user', 'product')  # Các trường bạn muốn lọc
    search_fields = ('user__username', 'product__title')  # Các trường tìm kiếm

class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'quantity', 'variant')  # Customize as per your Cart model fields
    search_fields = ('user__username', 'product__title')  # Enable search by related user and product fields

class AddressAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'specific_address', 'phone_number', 'address_type')
    search_fields = ('full_name', 'specific_address', 'phone_number')

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1

class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'full_name', 'total_price', 'payment_method', 'order_time', 'status']
    list_filter = ['order_time', 'payment_method', 'status']
    search_fields = ['full_name', 'phone_number', 'user__username']
    inlines = [OrderItemInline]
    readonly_fields = ['order_time']


admin.site.register(Product, ProductAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(WishlistItem, WishlistItemAdmin)
admin.site.register(CartItem, CartAdmin)
admin.site.register(Address, AddressAdmin)
admin.site.register(Order, OrderAdmin)
