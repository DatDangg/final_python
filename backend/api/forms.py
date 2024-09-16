from django import forms
from .models import Product, ProductVariant, Category, Order
from django.core.exceptions import ValidationError

class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = ['name', 'image']  # Các trường bạn muốn chỉnh sửa

class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = ['title', 'brand', 'category', 'description']  # Các trường bạn muốn sửa đổi

class ProductVariantForm(forms.ModelForm):
    class Meta:
        model = ProductVariant
        fields = ['color', 'storage', 'listed_price', 'quantity', 'cost_price', 'SKU']  # Ensure 'SKU' is included

    def clean_SKU(self):
        # Lấy giá trị SKU từ form
        SKU = self.cleaned_data.get('SKU')
        
        # Kiểm tra xem có sản phẩm nào khác có SKU trùng không
        if SKU:
            # Nếu form đang chỉnh sửa một biến thể, lấy ID của biến thể đó
            instance = self.instance
            # Kiểm tra xem SKU đã tồn tại chưa, ngoại trừ biến thể hiện tại
            if ProductVariant.objects.filter(SKU=SKU).exclude(id=instance.id).exists():
                raise ValidationError("Product variant with this SKU already exists.")
        
        return SKU

class OrderStatusForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = ['status']  # Chỉ cần thay đổi trạng thái đơn hàng
        widgets = {
            'status': forms.Select(choices=Order.STATUS_CHOICES)
        }