from django import forms
from django.forms import modelformset_factory
from .models import Product, PhoneDetail, SmartwatchDetail, ComputerDetail, HeadphoneDetail, ProductVariant, ProductImage, Category, Order
from django.core.exceptions import ValidationError

class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = ['name', 'image']  

class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = ['title', 'brand', 'category', 'description']  

class ProductVariantForm(forms.ModelForm):
    class Meta:
        model = ProductVariant
        fields = ['color', 'storage', 'listed_price', 'quantity', 'discount', 'cost_price', 'SKU']  

    def clean_SKU(self):
        SKU = self.cleaned_data.get('SKU')
        if SKU:
            instance = self.instance
            if ProductVariant.objects.filter(SKU=SKU).exclude(id=instance.id).exists():
                raise ValidationError("Product variant with this SKU already exists.")
        
        return SKU

ProductVariantFormSet = modelformset_factory(
    ProductVariant,
    form=ProductVariantForm,
    extra=0,  # Không tạo thêm form tự động
    can_delete=True  # Cho phép xóa biến thể
)

class ProductImageForm(forms.ModelForm):
    class Meta:
        model = ProductImage
        fields = ['image', 'is_primary']

ProductImageFormSet = modelformset_factory(
    ProductImage,
    form=ProductImageForm,
    extra=1,  # Số form trống ban đầu
    can_delete=True  # Cho phép xóa ảnh
)        

class OrderStatusForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = ['status']  # Chỉ cần cập nhật trường trạng thái
        widgets = {
            'status': forms.Select(choices=Order.STATUS_CHOICES)  # Dropdown cho các trạng thái
        }

class PhoneDetailForm(forms.ModelForm):
    class Meta:
        model = PhoneDetail
        fields = ['cpu', 'main_camera', 'front_camera', 'battery_capacity', 'screen_size', 'refresh_rate', 'pixel_density', 'screen_type']

class ComputerDetailForm(forms.ModelForm):
    class Meta:
        model = ComputerDetail
        fields = ['processor', 'ram', 'graphics_card', 'screen_size', 'battery_life']

class SmartwatchDetailForm(forms.ModelForm):
    class Meta:
        model = SmartwatchDetail
        fields = ['strap_type', 'screen_size', 'battery_capacity', 'water_resistance', 'heart_rate_monitor']

class HeadphoneDetailForm(forms.ModelForm):
    class Meta:
        model = HeadphoneDetail
        fields = ['wireless', 'battery_life', 'noise_cancellation', 'driver_size']