from django.contrib import admin
from .models import Product, Category, WishlistItem, CartItem, Address, Order, OrderItem, ProductImage, PhoneDetail, ComputerDetail, HeadphoneDetail, ProductVariant, SmartwatchDetail

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

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ['color', 'storage', 'cost_price', 'listed_price', 'discount', 'quantity', 'SKU']

class ProductAdmin(admin.ModelAdmin):
    inlines = [ProductImageInline, ProductVariantInline]  
    list_display = ("title", "brand", "image_count", "description", "category")
    list_filter = ("category",)
    search_fields = ("title", "brand", "category__name")

    def get_inline_instances(self, request, obj=None):
        inlines = []

        inlines.append(ProductImageInline(self.model, self.admin_site))
        inlines.append(ProductVariantInline(self.model, self.admin_site))

        if obj and obj.category.name == "Smart Phones":
            inlines.append(PhoneDetailInline(self.model, self.admin_site))
        elif obj and obj.category.name == "Computers":
            inlines.append(ComputerDetailInline(self.model, self.admin_site))
        elif obj and obj.category.name == "Headphones":
            inlines.append(HeadphoneDetailInline(self.model, self.admin_site))
        elif obj and obj.category.name == "Smart Watches":
            inlines.append(SmartwatchDetailInline(self.model, self.admin_site))

        return inlines 

    def image_count(self, obj):
        return obj.images.count()

    image_count.short_description = 'Number of Images'

class CategoryAdmin(admin.ModelAdmin):  
    list_display = ("name", "image")

class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'added_at') 
    list_filter = ('user', 'product')  
    search_fields = ('user__username', 'product__title')  

class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'quantity', 'variant') 
    search_fields = ('user__username', 'product__title')  

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
