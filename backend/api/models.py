from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from decimal import Decimal

class Category(models.Model):
    name = models.CharField(max_length=255)
    image = models.ImageField(upload_to='categories/')

    def __str__(self):
        return self.name

class Product(models.Model):
    title = models.CharField(max_length=255)
    brand = models.CharField(max_length=255)
    description = models.TextField()
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)

    def primary_image(self):
        # Kiểm tra nếu có ảnh chính
        primary_image = self.images.filter(is_primary=True).first()
        if primary_image:
            return primary_image.image.url  # Trả về URL của trường image
        return None

    def __str__(self):
        return self.title


class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/')
    is_primary = models.BooleanField(default=False)  # New field to indicate the primary image

    def __str__(self):
        return f"Image for {self.product.title}"

class PhoneDetail(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE)
    cpu = models.CharField(max_length=255)
    main_camera = models.CharField(max_length=255)
    front_camera = models.CharField(max_length=255)
    battery_capacity = models.CharField(max_length=255)
    screen_size = models.CharField(max_length=255)
    refresh_rate = models.CharField(max_length=255)
    pixel_density = models.CharField(max_length=255)
    screen_type = models.CharField(max_length=255)

    def __str__(self):
        return f"Details for {self.product.title}"


class ComputerDetail(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE)
    processor = models.CharField(max_length=255)
    ram = models.CharField(max_length=255)
    graphics_card = models.CharField(max_length=255)
    screen_size = models.CharField(max_length=255)
    battery_life = models.CharField(max_length=255)

    def __str__(self):
        return f"Details for {self.product.title}"


class HeadphoneDetail(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE)
    wireless = models.BooleanField(default=False)
    battery_life = models.CharField(max_length=255)
    noise_cancellation = models.BooleanField(default=False)
    driver_size = models.CharField(max_length=255)

    def __str__(self):
        return f"Details for {self.product.title}"

class SmartwatchDetail(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE)
    strap_type = models.CharField(max_length=255)  # Loại dây đeo
    screen_size = models.CharField(max_length=255)  # Kích thước màn hình
    battery_capacity = models.CharField(max_length=255)  # Dung lượng pin
    water_resistance = models.BooleanField(default=False)  # Chống nước
    heart_rate_monitor = models.BooleanField(default=False)  # Có theo dõi nhịp tim hay không

    def __str__(self):
        return f"Details for {self.product.title}"

class ProductVariant(models.Model):
    product = models.ForeignKey(Product, related_name='variants', on_delete=models.CASCADE)
    color = models.CharField(max_length=100)
    storage = models.CharField(max_length=100, blank=True, null=True)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    listed_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.PositiveIntegerField(default=0)  # Tỉ lệ giảm giá, lưu dưới dạng phần trăm
    quantity = models.PositiveIntegerField()
    SKU = models.CharField(max_length=100, unique=True)

    def discounted_price(self):
        """Tính toán giá sau khi giảm giá"""
        discount_amount = (Decimal(self.discount) / Decimal(100)) * self.listed_price
        return self.listed_price - discount_amount

    def __str__(self):
        return f"{self.product.title} - {self.color} - {self.storage} - {self.SKU}"


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female')], blank=True)
    phone_number = models.CharField(max_length=15, blank=True)

    def __str__(self):
        return self.user.username

class WishlistItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')

class CartItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, null=True, blank=True)  # Add variant here
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ('user', 'product', 'variant')  # Modify the unique constraint


class Address(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="addresses")
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=15)
    specific_address = models.TextField()
    address_type = models.CharField(max_length=10, choices=[('HOME', 'Home'), ('OFFICE', 'Office')])

    def __str__(self):
        return f"{self.full_name}, {self.specific_address}"

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    address = models.TextField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50)
    order_time = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"Order {self.id} by {self.user.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)  # ForeignKey đến Product
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} of {self.product.title} in order {self.order.id}"

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    rating = models.IntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.product.title} ({self.rating})"
