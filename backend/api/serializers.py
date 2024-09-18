from rest_framework import serializers
from .models import Product, Category, Profile, WishlistItem, CartItem, Address, Order, OrderItem, Review, ProductImage, HeadphoneDetail, PhoneDetail, ComputerDetail, ProductVariant, SmartwatchDetail
from django.contrib.auth.models import User

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'image']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_primary']  # Include is_primary

class PhoneDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhoneDetail
        fields = '__all__'

class ComputerDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComputerDetail
        fields = '__all__'

class HeadphoneDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeadphoneDetail
        fields = '__all__'

class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['id', 'color', 'storage', 'cost_price', 'listed_price', 'quantity','SKU']

class SmartwatchDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = SmartwatchDetail
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    phone_details = PhoneDetailSerializer(required=False)
    computer_details = ComputerDetailSerializer(required=False)
    headphone_details = HeadphoneDetailSerializer(required=False)
    smartwatch_details = SmartwatchDetailSerializer(required=False)
    variants = ProductVariantSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = '__all__'

    def create(self, validated_data):
        phone_data = validated_data.pop('phone_details', None)
        computer_data = validated_data.pop('computer_details', None)
        headphone_data = validated_data.pop('headphone_details', None)
        smartwatch_data = validated_data.pop('smartwatch_details', None)

        # Tạo sản phẩm trước
        product = Product.objects.create(**validated_data)

        # Tạo chi tiết sản phẩm dựa trên category (trước đây là product_type)
        if product.category.name == "Phone" and phone_data:
            PhoneDetail.objects.create(product=product, **phone_data)
        elif product.category.name == "Computer" and computer_data:
            ComputerDetail.objects.create(product=product, **computer_data)
        elif product.category.name == "Headphone" and headphone_data:
            HeadphoneDetail.objects.create(product=product, **headphone_data)
        elif product.category.name == "Smartwatch" and smartwatch_data:
            SmartwatchDetail.objects.create(product=product, **smartwatch_data)

        return product

    def update(self, instance, validated_data):
        phone_data = validated_data.pop('phone_details', None)
        computer_data = validated_data.pop('computer_details', None)
        headphone_data = validated_data.pop('headphone_details', None)
        smartwatch_data = validated_data.pop('smartwatch_details', None)

        # Cập nhật thông tin sản phẩm
        instance = super().update(instance, validated_data)

        # Cập nhật chi tiết sản phẩm dựa trên category
        if instance.category.name == "Smart Phones" and phone_data:
            PhoneDetail.objects.update_or_create(product=instance, defaults=phone_data)
        elif instance.category.name == "Computers" and computer_data:
            ComputerDetail.objects.update_or_create(product=instance, defaults=computer_data)
        elif instance.category.name == "Headphones" and headphone_data:
            HeadphoneDetail.objects.update_or_create(product=instance, defaults=headphone_data)
        elif instance.category.name == "Smart Watches" and smartwatch_data:
            SmartwatchDetail.objects.update_or_create(product=instance, defaults=smartwatch_data)

        return instance

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['date_of_birth', 'gender', 'phone_number', 'avatar']

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

        # Xử lý upload avatar
        avatar = profile_data.get('avatar')
        if avatar:
            profile.avatar = avatar

        profile.save()

        return instance

class WishlistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = WishlistItem
        fields = ['id', 'product', 'added_at']
    
class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer()
    variant = ProductVariantSerializer()  # Add the variant serializer

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'variant', 'quantity']  # Include variant in fields


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
        
        # Thay thế tìm kiếm product bằng id thay vì title
        for item_data in items_data:
            product_id = item_data['product'].id
            product = Product.objects.get(id=product_id)
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item_data['quantity'],
                price=item_data['price']
            )
        return order

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'user', 'product', 'order', 'rating', 'comment', 'created_at']
        read_only_fields = ['user', 'created_at']

    def create(self, validated_data):
        order = validated_data.get('order')
        product = validated_data.get('product')

        if Review.objects.filter(order=order, product=product).exists():
            raise serializers.ValidationError("Sản phẩm này đã được đánh giá trong đơn hàng này.")
        
        return super().create(validated_data)

