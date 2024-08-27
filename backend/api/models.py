from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=255)
    image = models.ImageField(upload_to='categories/')

    def __str__(self):
        return self.name

class Api(models.Model):
    title = models.CharField(max_length=255)
    brand = models.CharField(max_length=255)
    images = models.ImageField(upload_to='products/')
    description = models.TextField()
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    listed_price = models.DecimalField(max_digits=10, decimal_places=2)
    SKU = models.CharField(max_length=100, unique=True)
    quantity = models.PositiveIntegerField()
    category = models.ForeignKey(Category, related_name='apis', on_delete=models.CASCADE)

    def __str__(self):
        return self.title
    
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female')], blank=True)
    phone_number = models.CharField(max_length=15, blank=True)

    def __str__(self):
        return self.user.username