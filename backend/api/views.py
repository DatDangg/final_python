from .models import Product, Category, WishlistItem, CartItem, Address, Order, Review, ProductImage, PhoneDetail, HeadphoneDetail, ComputerDetail, SmartwatchDetail, ProductVariant
from .serializers import ProductSerializer, CategorySerializer, UserSerializer, CartItemSerializer, AddressSerializer, OrderSerializer, ReviewSerializer, PhoneDetailSerializer, ComputerDetailSerializer, HeadphoneDetailSerializer, SmartwatchDetailSerializer
from rest_framework import viewsets, filters, generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404, render
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.http import JsonResponse
import requests
from datetime import datetime, timedelta

class ProductListView(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter]
    filterset_fields = ['category']  # Cho phép lọc theo category
    search_fields = ['title', 'brand', 'description']

    @action(detail=True, methods=['patch'], url_path='update-variant')
    def update_variant(self, request, pk=None):
        product = self.get_object()
        variant_id = request.data.get('variant_id')
        new_quantity = request.data.get('quantity')
        
        try:
            variant = product.variants.get(id=variant_id)
            variant.quantity = new_quantity
            variant.save()
            return Response({'status': 'Variant updated successfully'}, status=status.HTTP_200_OK)
        except ProductVariant.DoesNotExist:
            return Response({'error': 'Variant not found'}, status=status.HTTP_404_NOT_FOUND)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        product_data = serializer.data
        
        # Thêm chi tiết sản phẩm dựa trên loại sản phẩm
        if instance.category.name == "Smart Phones":
            phone_details = PhoneDetail.objects.filter(product=instance).first()
            if phone_details:
                product_data['phone_details'] = PhoneDetailSerializer(phone_details).data
        elif instance.category.name == "Computers":
            computer_details = ComputerDetail.objects.filter(product=instance).first()
            if computer_details:
                product_data['computer_details'] = ComputerDetailSerializer(computer_details).data
        elif instance.category.name == "Headphones":
            headphone_details = HeadphoneDetail.objects.filter(product=instance).first()
            if headphone_details:
                product_data['headphone_details'] = HeadphoneDetailSerializer(headphone_details).data
        elif instance.category.name == "Smart Watches":
            smartwatch_details = SmartwatchDetail.objects.filter(product=instance).first()
            if smartwatch_details:
                product_data['smartwatch_details'] = SmartwatchDetailSerializer(smartwatch_details).data

        return Response(product_data)

@api_view(['POST'])
def upload_product_images(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    images = request.FILES.getlist('images')
    for image in images:
        ProductImage.objects.create(product=product, image=image)
    return Response({'message': 'Images uploaded successfully'}, status=status.HTTP_201_CREATED)


class CategoryListView(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

@api_view(['POST'])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, password=password, email=email)
    token, created = Token.objects.get_or_create(user=user)
    return Response({'token': token.key}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    
    if user is not None:
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)

class UserListView(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]  # Chỉ cho phép người dùng đã xác thực truy cập

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class WishlistToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        wishlist_item, created = WishlistItem.objects.get_or_create(
            user=request.user, product=product
        )
        if not created:
            wishlist_item.delete()
            return Response({'is_in_wishlist': False})
        return Response({'is_in_wishlist': True})

class WishlistStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        in_wishlist = WishlistItem.objects.filter(user=request.user, product=product).exists()
        return Response({'is_in_wishlist': in_wishlist})
    
class WishlistListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProductSerializer

    def get_queryset(self):
        return Product.objects.filter(wishlistitem__user=self.request.user)
    
class CartItemView(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        cart_items = CartItem.objects.filter(user=request.user)
        serializer = CartItemSerializer(cart_items, many=True)
        return Response(serializer.data)

    def create(self, request):
        product_id = request.data.get('product_id')
        variant_id = request.data.get('variant_id')  
        quantity = request.data.get('quantity', 1)
        product = get_object_or_404(Product, id=product_id)
        variant = get_object_or_404(ProductVariant, id=variant_id)

        cart_item, created = CartItem.objects.get_or_create(
            user=request.user,
            product=product,
            variant=variant, 
            defaults={'quantity': quantity}
        )

        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        return Response({'message': 'Item added to cart'}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['delete'], url_path='clear_cart')
    def clear_cart(self, request):
        user = request.user
        try:
            CartItem.objects.filter(user=user).delete()
            return Response({"message": "Cart cleared successfully."}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to clear cart for user {user.id}: {str(e)}", exc_info=True)
            return Response({"error": "Failed to clear cart: Server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def destroy(self, request, pk=None):
        cart_item = get_object_or_404(CartItem, pk=pk, user=request.user)
        cart_item.delete()
        return Response({'message': 'Item removed from cart'}, status=status.HTTP_204_NO_CONTENT)

    def partial_update(self, request, pk=None):
        cart_item = get_object_or_404(CartItem, pk=pk, user=request.user)
        quantity = request.data.get('quantity')
        
        if quantity is not None:
            cart_item.quantity = quantity
            cart_item.save()
            return Response({'message': 'Quantity updated'}, status=status.HTTP_200_OK)
        
        return Response({'error': 'Quantity not provided'}, status=status.HTTP_400_BAD_REQUEST)


class AddressView(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(profile__user=self.request.user)

    def perform_create(self, serializer):
        profile = self.request.user.profile
        serializer.save(profile=profile)

class OrderView(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Return only the orders belonging to the authenticated user
        return Order.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Gán user từ request.user vào serializer
        serializer.save(user=self.request.user)

class ReviewView(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        queryset = super().get_queryset()
        product_id = self.request.query_params.get('product_id', None)
        if product_id is not None:
            queryset = queryset.filter(product__id=product_id)
        return queryset

class ResetPasswordView(APIView):
    def post(self, request):
        username = request.data.get('username')
        new_password = request.data.get('newPassword')

        try:
            user = User.objects.get(username=username)
            user.set_password(new_password)
            user.save()
            return Response({'message': 'Password reset successful.'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def check_transaction(request):
    url = "https://my.sepay.vn/userapi/transactions/list"
    headers = {
        "Authorization": "Bearer DV639G7MCQYBSDKIUVOXPWKL7XRNF21YPD5YYOF6LVQUCFOOEZRIAHAXAAGTZXCI"
    }

    # Lấy tổng tiền từ yêu cầu React
    total_amount = request.GET.get('total_amount')
    
    # Lấy thời gian hiện tại và trừ đi 2 phút
    current_time = datetime.now()
    two_minutes_ago = current_time - timedelta(minutes=2)

    try:
        # Gửi yêu cầu GET đến SePay API để lấy danh sách giao dịch
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            transactions = response.json().get("transactions", [])

            # Kiểm tra giao dịch có trùng số tiền và trong khoảng thời gian 2 phút
            matching_transaction = None
            for transaction in transactions:
                transaction_time = datetime.strptime(transaction["transaction_date"], '%Y-%m-%d %H:%M:%S')
                if float(transaction["amount_in"]) == float(total_amount) and two_minutes_ago <= transaction_time <= current_time:
                    matching_transaction = transaction
                    break

            if matching_transaction:
                return JsonResponse({
                    "message": "Thanh toán thành công!",
                    "transaction": matching_transaction
                }, status=200)
            else:
                return JsonResponse({
                    "message": "Không tìm thấy giao dịch khớp với số tiền và thời gian."
                }, status=404)
        else:
            return JsonResponse({
                "message": "Lỗi khi gọi API SePay.",
                "error": response.text
            }, status=response.status_code)

    except requests.RequestException as e:
        return JsonResponse({
            "message": "Lỗi khi kết nối với API SePay.",
            "error": str(e)
        }, status=500)

# myapp/views.py
from django.shortcuts import render, get_object_or_404, redirect
from .models import Product, Category, Order, User  # Import các model cần thiết
from .forms import ProductForm, CategoryForm  # Import các form cần thiết
from django.shortcuts import render
from django.db.models import Sum
from .models import Order, Product, Category
from django.contrib.auth.models import User
from decimal import Decimal
from django.db.models.functions import TruncMonth
from .forms import ProductForm, ProductVariantForm  # Form cho sản phẩm và biến thể


# View cho trang Dashboard (Tổng quan)

# View cho trang dashboard
def dashboard_view(request):
    # Chỉ đếm các đơn hàng có trạng thái 'delivered'
    total_orders = Order.objects.filter(status='delivered').count()

    # Chỉ tính tổng doanh thu từ các đơn hàng có trạng thái 'delivered'
    total_sales = Order.objects.filter(status='delivered').aggregate(total_sales=Sum('total_price'))['total_sales'] or 0
    
    # Tính lợi nhuận dựa trên tổng doanh thu (giả sử lợi nhuận là 10%)
    total_profit = total_sales * Decimal('0.1')  # Lợi nhuận giả định 10% tổng doanh thu

    # Lấy dữ liệu doanh thu theo tháng (chỉ đơn hàng 'delivered')
    sales_data = (Order.objects.filter(status='delivered')
                  .annotate(month=TruncMonth('order_time'))  # Lấy tháng từ ngày đặt hàng
                  .values('month')  # Nhóm theo tháng
                  .annotate(sales=Sum('total_price'))  # Tính tổng doanh thu cho từng tháng
                  .order_by('month'))  # Sắp xếp theo tháng

    context = {
        'total_orders': total_orders,
        'total_sales': total_sales,
        'total_profit': total_profit,
        'sales_data': list(sales_data),  # Chuyển sales_data thành danh sách để dùng trong template
    }

    return render(request, 'dashboard_overview.html', context)

# View cho danh sách sản phẩm
def product_list_view(request):
    products = Product.objects.prefetch_related('variants').all()  # Lấy tất cả sản phẩm và biến thể liên quan

    # Tạo danh sách chứa thông tin từng sản phẩm và biến thể của nó
    product_data = []
    for product in products:
        for variant in product.variants.all():  # Duyệt qua từng biến thể
            product_detail = None
            if hasattr(product, 'phonedetail'):
                product_detail = {
                    'cpu': product.phonedetail.cpu,
                    'main_camera': product.phonedetail.main_camera,
                }
            elif hasattr(product, 'computerdetail'):
                product_detail = {
                    'processor': product.computerdetail.processor,
                    'ram': product.computerdetail.ram,
                }
            elif hasattr(product, 'headphonedetail'):
                product_detail = {
                    'wireless': product.headphonedetail.wireless,
                    'battery_life': product.headphonedetail.battery_life,
                }
            elif hasattr(product, 'smartwatchdetail'):
                product_detail = {
                    'strap_type': product.smartwatchdetail.strap_type,
                    'screen_size': product.smartwatchdetail.screen_size,
                }

            # Thêm từng biến thể vào danh sách
            product_data.append({
                'product': product,
                'variant': variant,
                'detail': product_detail,
            })

    return render(request, 'product_list.html', {'product_data': product_data})

# View cho chỉnh sửa sản phẩm
def edit_product(request, product_id, variant_id):
    product = get_object_or_404(Product, id=product_id)
    variant = get_object_or_404(ProductVariant, id=variant_id)  # Lấy biến thể cụ thể

    if request.method == 'POST':
        product_form = ProductForm(request.POST, instance=product)
        variant_form = ProductVariantForm(request.POST, instance=variant)

        if product_form.is_valid() and variant_form.is_valid():
            product_form.save()
            variant_form.save()
            return redirect('product_list')  # Sau khi lưu, quay lại danh sách sản phẩm
    else:
        product_form = ProductForm(instance=product)
        variant_form = ProductVariantForm(instance=variant)

    return render(request, 'edit_product.html', {
        'product_form': product_form,
        'variant_form': variant_form,  # Chỉ truyền form của một biến thể cụ thể vào template
    })

# View cho danh sách danh mục
def category_list_view(request):
    categories = Category.objects.all()  # Lấy tất cả danh mục từ database
    return render(request, 'category_list.html', {'categories': categories})

# View cho chỉnh sửa danh mục
def edit_category(request, category_id):
    category = get_object_or_404(Category, id=category_id)
    
    if request.method == 'POST':
        form = CategoryForm(request.POST, request.FILES, instance=category)
        if form.is_valid():
            form.save()
            return redirect('category_list')  # Điều hướng về trang danh sách danh mục sau khi lưu
    else:
        form = CategoryForm(instance=category)
    
    return render(request, 'edit_category.html', {'form': form})

# View cho quản lý đơn hàng
def order_list_view(request):
    orders = Order.objects.all()  # Lấy tất cả đơn hàng
    return render(request, 'order_list.html', {'orders': orders})

# View cho danh sách người dùng
def user_list_view(request):
    users = User.objects.all()  # Lấy tất cả người dùng
    return render(request, 'user_list.html', {'users': users})

from django.shortcuts import render, get_object_or_404, redirect
from .models import Order
from .forms import OrderStatusForm

def order_list_view(request):
    orders = Order.objects.all()  # Lấy danh sách tất cả các đơn hàng

    # Kiểm tra nếu người dùng gửi form để cập nhật trạng thái
    if request.method == 'POST':
        order_id = request.POST.get('order_id')  # Lấy ID của đơn hàng từ form
        order = get_object_or_404(Order, id=order_id)  # Lấy đơn hàng dựa trên ID
        form = OrderStatusForm(request.POST, instance=order)  # Form cập nhật trạng thái của đơn hàng

        if form.is_valid():
            form.save()  # Lưu trạng thái mới vào cơ sở dữ liệu
            return redirect('order_list')  # Sau khi lưu, điều hướng lại danh sách đơn hàng

    return render(request, 'order_list.html', {'orders': orders})

from django.shortcuts import render, redirect
from .models import Product, PhoneDetail, ComputerDetail, SmartwatchDetail, HeadphoneDetail, Category
from .forms import ProductForm, PhoneDetailForm, ComputerDetailForm, SmartwatchDetailForm, HeadphoneDetailForm, ProductVariantForm

def add_product_view(request):
    if request.method == 'POST':
        product_form = ProductForm(request.POST)
        variant_form = ProductVariantForm(request.POST)

        if product_form.is_valid() and variant_form.is_valid():
            product = product_form.save()
            variant = variant_form.save(commit=False)
            variant.product = product
            variant.save()

            # Dựa vào category, ta sẽ hiển thị form chi tiết tương ứng
            category_name = product.category.name

            if category_name == "Smart Phones":
                phone_detail_form = PhoneDetailForm(request.POST)
                if phone_detail_form.is_valid():
                    phone_detail = phone_detail_form.save(commit=False)
                    phone_detail.product = product
                    phone_detail.save()
            elif category_name == "Computers":
                computer_detail_form = ComputerDetailForm(request.POST)
                if computer_detail_form.is_valid():
                    computer_detail = computer_detail_form.save(commit=False)
                    computer_detail.product = product
                    computer_detail.save()
            elif category_name == "Smart Watches":
                smartwatch_detail_form = SmartwatchDetailForm(request.POST)
                if smartwatch_detail_form.is_valid():
                    smartwatch_detail = smartwatch_detail_form.save(commit=False)
                    smartwatch_detail.product = product
                    smartwatch_detail.save()
            elif category_name == "Headphones":
                headphone_detail_form = HeadphoneDetailForm(request.POST)
                if headphone_detail_form.is_valid():
                    headphone_detail = headphone_detail_form.save(commit=False)
                    headphone_detail.product = product
                    headphone_detail.save()

            return redirect('product_list')
    else:
        product_form = ProductForm()
        variant_form = ProductVariantForm()

    return render(request, 'add_product.html', {
        'product_form': product_form,
        'variant_form': variant_form,
        'phone_detail_form': PhoneDetailForm(),
        'computer_detail_form': ComputerDetailForm(),
        'smartwatch_detail_form': SmartwatchDetailForm(),
        'headphone_detail_form': HeadphoneDetailForm(),
    })

from django.shortcuts import render, redirect
from .models import Category
from .forms import CategoryForm

def add_category_view(request):
    if request.method == 'POST':
        form = CategoryForm(request.POST, request.FILES)  # Sử dụng request.FILES để xử lý ảnh
        if form.is_valid():
            form.save()
            return redirect('category_list')  # Điều hướng về trang danh sách Category sau khi lưu thành công
    else:
        form = CategoryForm()

    return render(request, 'add_category.html', {'form': form})
