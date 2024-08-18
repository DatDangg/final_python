from django.shortcuts import render
from rest_framework import viewsets
from .models import Api, Category
from .serializers import ApiSerializer, CategorySerializer

class APiListView(viewsets.ModelViewSet):
    queryset = Api.objects.all()
    serializer_class = ApiSerializer
    

class CategoryListView(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
