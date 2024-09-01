# Generated by Django 3.2 on 2024-09-01 05:01

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_cartitem'),
    ]

    operations = [
        migrations.CreateModel(
            name='Address',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('full_name', models.CharField(max_length=255)),
                ('phone_number', models.CharField(max_length=15)),
                ('specific_address', models.TextField()),
                ('address_type', models.CharField(choices=[('HOME', 'Home'), ('OFFICE', 'Office')], max_length=10)),
                ('profile', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='addresses', to='api.profile')),
            ],
        ),
    ]
