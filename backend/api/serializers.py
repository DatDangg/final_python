from rest_framework import serializers
from .models import Product, Category, Profile, WishlistItem, CartItem
from django.contrib.auth.models import User

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'image']

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer()
    class Meta:
        model = Product
        fields = ['id', 'title', 'brand', 'images', 'description', 'cost_price', 'listed_price', 'SKU', 'quantity', 'category']

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['date_of_birth', 'gender', 'phone_number']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile']

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.save()

        profile, created = Profile.objects.get_or_create(user=instance)
        profile.date_of_birth = profile_data.get('date_of_birth', profile.date_of_birth)
        profile.gender = profile_data.get('gender', profile.gender)
        profile.phone_number = profile_data.get('phone_number', profile.phone_number)
        profile.save()

        return instance

class WishlistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = WishlistItem
        fields = ['id', 'product', 'added_at']
    
class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity']