from rest_framework import serializers
from .models import Product, Category, Profile, WishlistItem, CartItem, Address, Order, OrderItem, Review, ProductImage
from django.contrib.auth.models import User

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'image']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_primary']  # Include is_primary

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer()  # Nối dữ liệu của category
    images = ProductImageSerializer(many=True, read_only=True)  # Nối danh sách các hình ảnh

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'brand', 'description', 
            'cost_price', 'listed_price', 'SKU', 'quantity', 'category', 
            'storage_product', 'color', 'data', 'cpu', 'NumberOfCores', 
            'MainCamera', 'FrontCamera', 'BatteryCapacity', 
            'screen_size', 'screen_refresh_rate', 'pixel', 'screen_type', 
            'additional_features', 'images'  # Thêm trường images vào
        ]


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

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'full_name', 'phone_number', 'specific_address', 'address_type']
    
class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['product', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'full_name', 'phone_number', 'address', 'total_price', 'payment_method', 'order_time', 'items', 'status']
        read_only_fields = ('user',) 

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        for item_data in items_data:
            product = Product.objects.get(title=item_data['product'])  # Tìm Product theo title
            OrderItem.objects.create(
                order=order,
                product=product,  # Truyền đối tượng product hoặc product.id
                quantity=item_data['quantity'],
                price=item_data['price']
            )
        return order

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'user', 'product', 'rating', 'comment', 'created_at']
        read_only_fields = ['user', 'created_at']

    def create(self, validated_data):
        return Review.objects.create(**validated_data)

