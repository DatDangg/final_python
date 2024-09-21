import requests
from .models import Product, Category, WishlistItem, CartItem, Address, Order, Review, ProductImage, PhoneDetail, HeadphoneDetail, ComputerDetail, SmartwatchDetail, ProductVariant
from .serializers import ProductSerializer, CategorySerializer, UserSerializer, CartItemSerializer, AddressSerializer, OrderSerializer, ReviewSerializer, PhoneDetailSerializer, ComputerDetailSerializer, HeadphoneDetailSerializer, SmartwatchDetailSerializer
from .forms import  ProductForm, CategoryForm, OrderStatusForm, PhoneDetailForm, ComputerDetailForm, SmartwatchDetailForm, HeadphoneDetailForm, ProductVariantForm, ProductImageFormSet, ProductVariantFormSet, ProductImageForm
from rest_framework import viewsets, filters, generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, update_session_auth_hash
from django.http import JsonResponse
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from datetime import datetime, timedelta
from decimal import Decimal
from django.forms import modelformset_factory

@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Yêu cầu phải đăng nhập
def change_password(request):
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')

    # Kiểm tra mật khẩu cũ
    if not user.check_password(old_password):
        return Response({"error": "Mật khẩu cũ không đúng."}, status=status.HTTP_400_BAD_REQUEST)

    # Đặt mật khẩu mới
    user.set_password(new_password)
    user.save()

    # Cập nhật session để người dùng không bị đăng xuất
    update_session_auth_hash(request, user)

    return Response({"success": "Đổi mật khẩu thành công!"}, status=status.HTTP_200_OK)


class ProductListView(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'brand', 'variants__storage']
    search_fields = ['title', 'brand', 'description']
    ordering_fields = ['variants__listed_price'] 

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Lấy tham số giá trị tối thiểu và tối đa từ request
        min_price = self.request.query_params.get('variants__listed_price__gte')
        max_price = self.request.query_params.get('variants__listed_price__lte')

        # Áp dụng lọc nếu có giá trị min_price hoặc max_price
        if min_price:
            queryset = queryset.filter(variants__listed_price__gte=min_price).distinct()
        if max_price:
            queryset = queryset.filter(variants__listed_price__lte=max_price).distinct()

        return queryset

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

@api_view(['GET'])
def best_selling_products(request):
    # Lấy những sản phẩm có số lượng bán > 0 (dựa trên OrderItem)
    best_selling_products = (Product.objects.annotate(total_sold=Count('orderitem'))
                             .filter(total_sold__gt=0)
                             .order_by('-total_sold')[:10])  # Lấy top 10 sản phẩm bán chạy nhất

    # Serialize dữ liệu
    serializer = ProductSerializer(best_selling_products, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def discounted_products(request):
    # Lấy những sản phẩm có discount > 50%
    discounted_variants = ProductVariant.objects.filter(discount__gt=50)
    
    # Lấy danh sách sản phẩm unique từ các variant
    discounted_products = set([variant.product for variant in discounted_variants])
    
    # Serialize dữ liệu
    serialized_products = ProductSerializer(discounted_products, many=True).data
    
    return Response(serialized_products)

@api_view(['GET'])
def brand_list(request):
    # Lấy danh sách các thương hiệu từ bảng Product và loại bỏ các thương hiệu trùng lặp
    brands = Product.objects.values('brand').annotate(count=Count('brand')).order_by('brand')
    
    # Tạo danh sách các thương hiệu
    brand_list = [brand['brand'] for brand in brands if brand['brand']]

    return Response(brand_list)
@api_view(['GET'])
def product_suggestions(request):
    query = request.GET.get('q', '')
    
    if query:
        # Filter products based on the title or description
        products = Product.objects.filter(title__icontains=query)  # Adjust based on your field
    else:
        products = Product.objects.none()  # No products if no query

    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

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
    permission_classes = [IsAuthenticated]

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
        return Order.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@api_view(['PUT'])
def cancel_order(request, order_id):
    try:
        # Lấy đơn hàng dựa trên ID
        order = Order.objects.get(id=order_id)
        
        # Kiểm tra nếu đơn hàng đã bị hủy
        if order.status == 'Cancelled':
            return Response({"error": "Order has already been cancelled."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Cập nhật trạng thái đơn hàng thành 'Cancelled'
        order.status = 'Cancelled'
        order.save()

        return Response({"message": "Order cancelled successfully"}, status=status.HTTP_200_OK)
    
    except Order.DoesNotExist:
        return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

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

@api_view(['GET'])
def get_reviews_by_order(request, order_id):
    reviews = Review.objects.filter(order=order_id, user=request.user)
    
    review_data = []
    for review in reviews:
        review_data.append({
            'product': review.product.id,
            'rating': review.rating,
            'comment': review.comment
        })
    
    return Response(review_data)

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

    total_amount = request.GET.get('total_amount')
    
    # Lấy thời gian hiện tại và trừ đi 2 phút
    current_time = datetime.now()
    two_minutes_ago = current_time - timedelta(minutes=2)

    try:
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

def dashboard_view(request):
    total_orders = Order.objects.filter(status='delivered').count()
    total_sales = Order.objects.filter(status='delivered').aggregate(total_sales=Sum('total_price'))['total_sales'] or 0  
    # Tính lợi nhuận dựa trên tổng doanh thu (giả sử lợi nhuận là 10%)
    total_profit = total_sales * Decimal('0.1')

    # Lấy dữ liệu doanh thu theo tháng (chỉ đơn hàng 'delivered')
    sales_data = (Order.objects.filter(status='delivered')
                  .annotate(month=TruncMonth('order_time'))  
                  .values('month')  
                  .annotate(sales=Sum('total_price'))  
                  .order_by('month'))

    sales_data_list = list(sales_data)

    context = {
        'total_orders': total_orders,
        'total_sales': total_sales,
        'total_profit': total_profit,
        'sales_data': sales_data_list, 
    }

    return render(request, 'dashboard_overview.html', context)

def product_list_view(request):
    products = Product.objects.prefetch_related('variants').all()  # Lấy sản phẩm và biến thể

    product_data = []
    counter = 1  # Khởi tạo biến đếm cho số thứ tự

    for product in products:
        # Collecting details based on product category
        product_detail = None
        if product.category.name == "Smart Phones" and hasattr(product, 'phonedetail'):
            product_detail = {
                'cpu': product.phonedetail.cpu,
                'main_camera': product.phonedetail.main_camera,
                'front_camera': product.phonedetail.front_camera,
                'battery_capacity': product.phonedetail.battery_capacity,
                'screen_size': product.phonedetail.screen_size,
                'refresh_rate': product.phonedetail.refresh_rate,
                'pixel_density': product.phonedetail.pixel_density,
                'screen_type': product.phonedetail.screen_type,
            }
        elif product.category.name == "Computers" and hasattr(product, 'computerdetail'):
            product_detail = {
                'processor': product.computerdetail.processor,
                'ram': product.computerdetail.ram,
                'graphics_card': product.computerdetail.graphics_card,
                'screen_size': product.computerdetail.screen_size,
                'battery_life': product.computerdetail.battery_life,
            }
        elif product.category.name == "Smart Watches" and hasattr(product, 'smartwatchdetail'):
            product_detail = {
                'strap_type': product.smartwatchdetail.strap_type,
                'screen_size': product.smartwatchdetail.screen_size,
                'battery_capacity': product.smartwatchdetail.battery_capacity,
                'water_resistance': product.smartwatchdetail.water_resistance,
                'heart_rate_monitor': product.smartwatchdetail.heart_rate_monitor,
            }
        elif product.category.name == "Headphones" and hasattr(product, 'headphonedetail'):
            product_detail = {
                'wireless': product.headphonedetail.wireless,
                'battery_life': product.headphonedetail.battery_life,
                'noise_cancellation': product.headphonedetail.noise_cancellation,
                'driver_size': product.headphonedetail.driver_size,
            }

        # Lặp qua các biến thể của sản phẩm và thêm STT cho từng biến thể
        for variant in product.variants.all():
            product_data.append({
                'stt': counter,  # Số thứ tự liên tục
                'product': product,
                'variant': variant,
                'details': product_detail,
            })
            counter += 1  # Tăng biến đếm sau mỗi biến thể

    return render(request, 'product_list.html', {'product_data': product_data})

def add_product_view(request):
    if request.method == 'POST':
        product_form = ProductForm(request.POST)
        variant_formset = ProductVariantFormSet(request.POST, request.FILES, prefix='variant')
        image_formset = ProductImageFormSet(request.POST, request.FILES, prefix='image')

        if product_form.is_valid() and variant_formset.is_valid() and image_formset.is_valid():
            # Lưu product
            product = product_form.save()

            # Lưu các variant của product
            variants = variant_formset.save(commit=False)  # Chưa commit ngay lập tức
            for variant in variants:
                variant.product = product  # Gán sản phẩm cho mỗi variant
                variant.save()

            # Lưu các hình ảnh của product
            images = image_formset.save(commit=False)  # Chưa commit ngay lập tức
            for image in images:
                image.product = product  # Gán sản phẩm cho mỗi image
                image.save()

            # Xóa các form được đánh dấu là xóa (trong formset)
            for form in variant_formset.deleted_forms:
                if form.instance.pk:
                    form.instance.delete()

            for form in image_formset.deleted_forms:
                if form.instance.pk:
                    form.instance.delete()

            # Xử lý lưu chi tiết sản phẩm dựa trên category
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
        variant_formset = ProductVariantFormSet(queryset=ProductVariant.objects.none(), prefix='variant')
        image_formset = ProductImageFormSet(queryset=ProductImage.objects.none(), prefix='image')

    return render(request, 'add_product.html', {
        'product_form': product_form,
        'variant_formset': variant_formset,
        'image_formset': image_formset,
        'phone_detail_form': PhoneDetailForm(),
        'computer_detail_form': ComputerDetailForm(),
        'smartwatch_detail_form': SmartwatchDetailForm(),
        'headphone_detail_form': HeadphoneDetailForm(),
    })

def edit_product(request, product_id, variant_id):
    product = get_object_or_404(Product, id=product_id)
    variant = get_object_or_404(ProductVariant, id=variant_id)  
    ProductImageFormSet = modelformset_factory(ProductImage, form=ProductImageForm, extra=1, can_delete=True)

    # Get or create the correct detail form based on the category
    phone_detail_form = None
    computer_detail_form = None
    smartwatch_detail_form = None
    headphone_detail_form = None

    if product.category.name == "Smart Phones":
        phone_detail, created = PhoneDetail.objects.get_or_create(product=product)
        phone_detail_form = PhoneDetailForm(request.POST or None, instance=phone_detail)

    elif product.category.name == "Computers":
        computer_detail, created = ComputerDetail.objects.get_or_create(product=product)
        computer_detail_form = ComputerDetailForm(request.POST or None, instance=computer_detail)

    elif product.category.name == "Smart Watches":
        smartwatch_detail, created = SmartwatchDetail.objects.get_or_create(product=product)
        smartwatch_detail_form = SmartwatchDetailForm(request.POST or None, instance=smartwatch_detail)

    elif product.category.name == "Headphones":
        headphone_detail, created = HeadphoneDetail.objects.get_or_create(product=product)
        headphone_detail_form = HeadphoneDetailForm(request.POST or None, instance=headphone_detail)

    if request.method == 'POST':
        product_form = ProductForm(request.POST, instance=product)
        variant_form = ProductVariantForm(request.POST, instance=variant)
        image_formset = ProductImageFormSet(request.POST, request.FILES, queryset=ProductImage.objects.filter(product=product))

        # Check if all forms are valid
        if product_form.is_valid() and variant_form.is_valid() and image_formset.is_valid():
            product_form.save()
            variant_form.save()

            for form in image_formset:
                if form.cleaned_data.get('DELETE') and form.instance.id:  # Ensure the instance has an ID before deleting
                    form.instance.delete()
                elif form.cleaned_data.get('image'):  # Check if an image is uploaded before saving
                    form.instance.product = product
                    form.save()

            # Save the corresponding detail form if it exists and is valid
            if phone_detail_form and phone_detail_form.is_valid():
                phone_detail_form.save()
            elif computer_detail_form and computer_detail_form.is_valid():
                computer_detail_form.save()
            elif smartwatch_detail_form and smartwatch_detail_form.is_valid():
                smartwatch_detail_form.save()
            elif headphone_detail_form and headphone_detail_form.is_valid():
                headphone_detail_form.save()

            return redirect('product_list')  # Redirect to product list

    else:
        product_form = ProductForm(instance=product)
        variant_form = ProductVariantForm(instance=variant)
        image_formset = ProductImageFormSet(queryset=ProductImage.objects.filter(product=product))  # Initialize image_formset for GET requests

    return render(request, 'edit_product.html', {
        'product_form': product_form,
        'variant_form': variant_form,
        'image_formset': image_formset,
        'phone_detail_form': phone_detail_form,
        'computer_detail_form': computer_detail_form,
        'smartwatch_detail_form': smartwatch_detail_form,
        'headphone_detail_form': headphone_detail_form,
    })


def delete_product_view(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    product.delete()
    return redirect('product_list')

def category_list_view(request):
    categories = Category.objects.all() 
    return render(request, 'category_list.html', {'categories': categories})

def add_category_view(request):
    if request.method == 'POST':
        form = CategoryForm(request.POST, request.FILES) 
        if form.is_valid():
            form.save()
            return redirect('category_list')
    else:
        form = CategoryForm()

    return render(request, 'add_category.html', {'form': form})

def edit_category(request, category_id):
    category = get_object_or_404(Category, id=category_id)
    
    if request.method == 'POST':
        form = CategoryForm(request.POST, request.FILES, instance=category)
        if form.is_valid():
            form.save()
            return redirect('category_list') 
    else:
        form = CategoryForm(instance=category)
    
    return render(request, 'edit_category.html', {'form': form})

def delete_category_view(request, category_id):
    category = get_object_or_404(Category, id=category_id)
    category.delete()
    return redirect('category_list')

def user_list_view(request):
    users = User.objects.all()  
    return render(request, 'user_list.html', {'users': users})

def order_list_view(request):
    orders = Order.objects.prefetch_related('items__product').all()  # Load cả các sản phẩm trong đơn hàng

    for order in orders:
        for item in order.items.all():
            item.total_price = item.quantity * item.price  # Tính tổng tiền cho mỗi mặt hàng

    if request.method == 'POST':
        order_id = request.POST.get('order_id')
        order = get_object_or_404(Order, id=order_id)
        form = OrderStatusForm(request.POST, instance=order)

        if form.is_valid():
            form.save()
            return redirect('order_list')  # Cập nhật trạng thái và reload trang

    return render(request, 'order_list.html', {'orders': orders})