from django.db import models

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



# class Banner(models.Model):
#     headline = models.CharField(max_length=255)
#     headlinetype = models.CharField(max_length=255)
#     description = models.TextField()
#     image = models.ImageField(upload_to='banner/')

#     def __str__(self):
#         return self.name

# mỗi lần thêm 1 model mới thì cần chạy makemigration -> migrate