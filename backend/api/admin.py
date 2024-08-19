from django.contrib import admin
from .models import Api, Category

class ApiAdmin(admin.ModelAdmin):
    list_display = ("title", "brand", "images", "description", "cost_price", "listed_price", "SKU", "quantity", "category")
    list_filter = ("category",)  # Optional: Adds a filter sidebar for categories
    search_fields = ("title", "brand", "category__name")  # Optional: Allows searching by category name

class CategoryAdmin(admin.ModelAdmin):  # Corrected typo in class name
    list_display = ("name", "image")

admin.site.register(Api, ApiAdmin)
admin.site.register(Category, CategoryAdmin)
