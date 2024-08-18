from rest_framework import serializers
from .models import Api, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'image']

class ApiSerializer(serializers.ModelSerializer):
    category = CategorySerializer()
    class Meta:
        model = Api
        fields = ['id', 'title', 'brand', 'images', 'description', 'cost_price', 'listed_price', 'SKU', 'quantity', 'category']