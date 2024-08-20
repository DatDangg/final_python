from django.shortcuts import render
from rest_framework import viewsets, filters
from .models import Api, Category
from .serializers import ApiSerializer, CategorySerializer

class APiListView(viewsets.ModelViewSet):
    queryset = Api.objects.all()
    serializer_class = ApiSerializer
    filter_backends = [filters.SearchFilter]  # Thêm SearchFilter để hỗ trợ tìm kiếm
    search_fields = ['title', 'brand', 'description']  # Các trường bạn muốn tìm kiếm

class CategoryListView(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
