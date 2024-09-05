from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Category(models.Model):
    name = models.CharField(max_length=255)
    image = models.ImageField(upload_to='categories/')

    def __str__(self):
        return self.name

class Product(models.Model):
    title = models.CharField(max_length=255)
    brand = models.CharField(max_length=255)
    description = models.TextField()
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    listed_price = models.DecimalField(max_digits=10, decimal_places=2)
    SKU = models.CharField(max_length=100, unique=True)
    quantity = models.PositiveIntegerField()
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    storage_product = models.CharField(max_length=255, blank=True)
    color = models.CharField(max_length=255, blank=True)
    data = models.CharField(max_length=255, blank=True)
    cpu = models.CharField(max_length=255, blank=True)
    NumberOfCores = models.CharField(max_length=255, blank=True)
    MainCamera = models.CharField(max_length=255, blank=True)
    FrontCamera = models.CharField(max_length=255, blank=True)
    BatteryCapacity = models.CharField(max_length=255, blank=True)
    screen_size = models.CharField(max_length=255, blank=True)
    screen_refresh_rate = models.CharField(max_length=255, blank=True)
    pixel = models.CharField(max_length=255, blank=True)
    screen_type = models.CharField(max_length=255, blank=True)
    additional_features = models.TextField(blank=True)  # If there are more extra features
    
    def primary_image(self):
        return self.images.filter(is_primary=True).first()
    
    def __str__(self):
        return self.title

class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/')
    is_primary = models.BooleanField(default=False)  # New field to indicate the primary image

    def __str__(self):
        return f"Image for {self.product.title}"


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
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ('user', 'product')

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
    rating = models.IntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.product.title} ({self.rating})"
