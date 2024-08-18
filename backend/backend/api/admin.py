from django.contrib import admin
from .models import Api, Category

class ApiAdmin(admin.ModelAdmin):
    list_display = ("title", "brand", "images", "description", "cost_price", "listed_price", "SKU", "quantity", "category")

class CategoryAdmin(admin.ModelAdmin):  # Corrected typo in class name
    list_display = ("name", "image")

admin.site.register(Api, ApiAdmin)
