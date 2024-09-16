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
from django.shortcuts import render
from django.db.models import Sum
from .models import Order, Product, Category
from django.contrib.auth.models import User
from decimal import Decimal
from django.db.models.functions import TruncMonth

def dashboard_view(request):
    # Đếm số lượng đơn hàng có trạng thái 'delivered'
    total_orders = Order.objects.filter(status='delivered').count()
    
    # Tính tổng doanh thu từ các đơn hàng có trạng thái 'delivered'
    total_sales = Order.objects.filter(status='delivered').aggregate(total_sales=Sum('total_price'))['total_sales'] or 0
    
    # Tính lợi nhuận dựa trên tổng doanh thu
    total_profit = total_sales * Decimal('0.1') if total_sales else 0

    # Tính tổng doanh thu theo tháng
    sales_data = (Order.objects.filter(status='delivered')
                  .annotate(month=TruncMonth('order_time'))
                  .values('month')
                  .annotate(sales=Sum('total_price'))
                  .order_by('month'))

    # Lấy danh sách các đơn hàng
    orders = Order.objects.all()

    # Nếu request là POST (người dùng thay đổi trạng thái đơn hàng)
    if request.method == 'POST' and 'order_id' in request.POST:
        order_id = request.POST.get('order_id')
        order = get_object_or_404(Order, id=order_id)
        form = OrderStatusForm(request.POST, instance=order)

        if form.is_valid():
            form.save()
            return redirect('dashboard')  # Sau khi cập nhật, điều hướng về dashboard

    # Khởi tạo form để cập nhật trạng thái đơn hàng
    form = OrderStatusForm()

    # Lấy tất cả sản phẩm và danh mục
    products = Product.objects.all()  # Lấy danh sách sản phẩm
    categories = Category.objects.all()  # Lấy danh sách danh mục
    users = User.objects.all()  # Lấy danh sách người dùng
    
    context = {
        'total_orders': total_orders,
        'total_sales': total_sales,
        'total_profit': total_profit,
        'sales_data': list(sales_data),  # Chuyển queryset thành danh sách để sử dụng trong template
        'products': products,
        'categories': categories,
        'users': users,
        'orders': orders,  # Đưa danh sách đơn hàng vào context
        'form': form,  # Đưa form để cập nhật trạng thái vào context
    }

    return render(request, 'dashboard.html', context)
from django.http import JsonResponse
from .models import Product

def product_list_view(request):
    products = Product.objects.all()
    
    product_data = []
    
    for product in products:
        product_details = {
            'id': product.id,
            'title': product.title,
            'brand': product.brand,
            'category': product.category.name,
            'variants': list(product.variants.values('color', 'storage', 'listed_price', 'quantity'))  # Serializing the variants
        }
        
        # Add product details if available
        if hasattr(product, 'phonedetail'):
            product_details['details'] = {
                'cpu': product.phonedetail.cpu,
                'main_camera': product.phonedetail.main_camera,
                # Add other phone details as necessary
            }
        elif hasattr(product, 'computerdetail'):
            product_details['details'] = {
                'processor': product.computerdetail.processor,
                'ram': product.computerdetail.ram,
                # Add other computer details as necessary
            }
        elif hasattr(product, 'headphonedetail'):
            product_details['details'] = {
                'wireless': product.headphonedetail.wireless,
                'battery_life': product.headphonedetail.battery_life,
                # Add other headphone details as necessary
            }
        elif hasattr(product, 'smartwatchdetail'):
            product_details['details'] = {
                'strap_type': product.smartwatchdetail.strap_type,
                'screen_size': product.smartwatchdetail.screen_size,
                # Add other smartwatch details as necessary
            }
        
        product_data.append(product_details)

    # Return the product data as JSON
    return JsonResponse({'products': product_data})



from django.shortcuts import get_object_or_404, redirect
from .models import Product, ProductVariant
from .forms import ProductForm, ProductVariantForm
from django.core.exceptions import ValidationError

def edit_product(request, product_id):
    product = get_object_or_404(Product, id=product_id)

    if request.method == 'POST':
        product_form = ProductForm(request.POST, instance=product)
        variant_form = ProductVariantForm(request.POST, instance=product.variants.first())

        if product_form.is_valid() and variant_form.is_valid():
            product = product_form.save()

            # Save the variant form
            variant = variant_form.save(commit=False)
            variant.product = product
            variant.save()

            # Redirect to the dashboard after saving
            return redirect('dashboard')  # Đảm bảo 'dashboard' là URL pattern trong urls.py
    
    else:
        product_form = ProductForm(instance=product)
        variant_form = ProductVariantForm(instance=product.variants.first())

    return render(request, 'edit_product.html', {
        'product_form': product_form,
        'variant_form': variant_form,
    })


from .forms import CategoryForm
def edit_category(request, category_id):
    category = get_object_or_404(Category, id=category_id)
    
    if request.method == 'POST':
        form = CategoryForm(request.POST, request.FILES, instance=category)  # Sử dụng request.FILES nếu bạn muốn sửa hình ảnh
        if form.is_valid():
            form.save()
            return redirect('dashboard')  # Điều hướng về dashboard sau khi lưu
    else:
        form = CategoryForm(instance=category)

    return render(request, 'edit_category.html', {'form': form})

from .forms import OrderStatusForm

def order_management_view(request):
    # Lấy danh sách tất cả các đơn hàng
    orders = Order.objects.all()

    # Kiểm tra xem có POST request không
    if request.method == 'POST':
        order_id = request.POST.get('order_id')
        order = get_object_or_404(Order, id=order_id)
        form = OrderStatusForm(request.POST, instance=order)

        if form.is_valid():
            form.save()
            return redirect('order_management')  # Điều hướng về trang quản lý đơn hàng sau khi cập nhật thành công
    else:
        form = OrderStatusForm()

    return render(request, 'order_management.html', {'orders': orders, 'form': form})