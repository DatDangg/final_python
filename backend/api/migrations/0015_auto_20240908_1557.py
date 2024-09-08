# Generated by Django 3.2 on 2024-09-08 08:57

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('api', '0014_auto_20240906_0018'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='product',
            name='BatteryCapacity',
        ),
        migrations.RemoveField(
            model_name='product',
            name='FrontCamera',
        ),
        migrations.RemoveField(
            model_name='product',
            name='MainCamera',
        ),
        migrations.RemoveField(
            model_name='product',
            name='NumberOfCores',
        ),
        migrations.RemoveField(
            model_name='product',
            name='SKU',
        ),
        migrations.RemoveField(
            model_name='product',
            name='additional_features',
        ),
        migrations.RemoveField(
            model_name='product',
            name='color',
        ),
        migrations.RemoveField(
            model_name='product',
            name='cost_price',
        ),
        migrations.RemoveField(
            model_name='product',
            name='cpu',
        ),
        migrations.RemoveField(
            model_name='product',
            name='data',
        ),
        migrations.RemoveField(
            model_name='product',
            name='listed_price',
        ),
        migrations.RemoveField(
            model_name='product',
            name='pixel',
        ),
        migrations.RemoveField(
            model_name='product',
            name='quantity',
        ),
        migrations.RemoveField(
            model_name='product',
            name='screen_refresh_rate',
        ),
        migrations.RemoveField(
            model_name='product',
            name='screen_size',
        ),
        migrations.RemoveField(
            model_name='product',
            name='screen_type',
        ),
        migrations.RemoveField(
            model_name='product',
            name='storage_product',
        ),
        migrations.CreateModel(
            name='SmartwatchDetail',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('strap_type', models.CharField(max_length=255)),
                ('screen_size', models.CharField(max_length=255)),
                ('battery_capacity', models.CharField(max_length=255)),
                ('water_resistance', models.BooleanField(default=False)),
                ('heart_rate_monitor', models.BooleanField(default=False)),
                ('product', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='api.product')),
            ],
        ),
        migrations.CreateModel(
            name='ProductVariant',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('color', models.CharField(max_length=100)),
                ('storage', models.CharField(blank=True, max_length=100, null=True)),
                ('cost_price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('listed_price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('quantity', models.PositiveIntegerField()),
                ('SKU', models.CharField(max_length=100, unique=True)),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='variants', to='api.product')),
            ],
        ),
        migrations.CreateModel(
            name='PhoneDetail',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('cpu', models.CharField(max_length=255)),
                ('main_camera', models.CharField(max_length=255)),
                ('front_camera', models.CharField(max_length=255)),
                ('battery_capacity', models.CharField(max_length=255)),
                ('screen_size', models.CharField(max_length=255)),
                ('refresh_rate', models.CharField(max_length=255)),
                ('pixel_density', models.CharField(max_length=255)),
                ('screen_type', models.CharField(max_length=255)),
                ('product', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='api.product')),
            ],
        ),
        migrations.CreateModel(
            name='HeadphoneDetail',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('wireless', models.BooleanField(default=False)),
                ('battery_life', models.CharField(max_length=255)),
                ('noise_cancellation', models.BooleanField(default=False)),
                ('driver_size', models.CharField(max_length=255)),
                ('product', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='api.product')),
            ],
        ),
        migrations.CreateModel(
            name='ComputerDetail',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('processor', models.CharField(max_length=255)),
                ('ram', models.CharField(max_length=255)),
                ('graphics_card', models.CharField(max_length=255)),
                ('screen_size', models.CharField(max_length=255)),
                ('battery_life', models.CharField(max_length=255)),
                ('product', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='api.product')),
            ],
        ),
        migrations.AddField(
            model_name='cartitem',
            name='variant',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.productvariant'),
        ),
        migrations.AlterUniqueTogether(
            name='cartitem',
            unique_together={('user', 'product', 'variant')},
        ),
    ]
