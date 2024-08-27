// tôi muốn tạo phần profile hiển thị thông tin của user và cho chỉnh sửa các thông tin:
// tên, ngày sinh, giới tính, email, số điện thoại 
// phần backend hiện tại của tôi là:
// api/apps:
// from django.apps import AppConfig

// class ApiConfig(AppConfig):
//     default_auto_field = 'django.db.models.BigAutoField'
//     name = 'api'

// class CategoryConfig(AppConfig):
//     default_auto_field = 'django.db.models.BigAutoField'
//     name = 'category'   
// api/models:
// from django.db import models

// class Category(models.Model):
//     name = models.CharField(max_length=255)
//     image = models.ImageField(upload_to='categories/')

//     def __str__(self):
//         return self.name

// class Api(models.Model):
//     title = models.CharField(max_length=255)
//     brand = models.CharField(max_length=255)
//     images = models.ImageField(upload_to='products/')
//     description = models.TextField()
//     cost_price = models.DecimalField(max_digits=10, decimal_places=2)
//     listed_price = models.DecimalField(max_digits=10, decimal_places=2)
//     SKU = models.CharField(max_length=100, unique=True)
//     quantity = models.PositiveIntegerField()
//     category = models.ForeignKey(Category, related_name='apis', on_delete=models.CASCADE)

//     def __str__(self):
//         return self.title
// api/serializer:
// from rest_framework import serializers
// from .models import Api, Category
// from django.contrib.auth.models import User

// class CategorySerializer(serializers.ModelSerializer):
//     class Meta:
//         model = Category
//         fields = ['id', 'name', 'image']

// class ApiSerializer(serializers.ModelSerializer):
//     category = CategorySerializer()
//     class Meta:
//         model = Api
//         fields = ['id', 'title', 'brand', 'images', 'description', 'cost_price', 'listed_price', 'SKU', 'quantity', 'category']

// class UserSerializer(serializers.ModelSerializer):
//     class Meta:
//         model = User
//         fields = ['id', 'username', 'email', 'date_joined']
// api/url:
// from django.urls import path, include
// from . import views
// from rest_framework.routers import DefaultRouter

// router = DefaultRouter()
// router.register(r'users', views.UserListView, basename='user')

// urlpatterns = [
//     path('register/', views.register, name='register'),  # Đường dẫn cho đăng ký
//     path('login/', views.login, name='login'),  # Đường dẫn cho đăng nhập
//     path('', include(router.urls)),  # Bao gồm tất cả các đường dẫn từ router
// ]

// api.view:
// # from django.shortcuts import render
// from rest_framework import viewsets, filters
// from .models import Api, Category
// from .serializers import ApiSerializer, CategorySerializer
// from rest_framework import status
// from rest_framework.response import Response
// from rest_framework.decorators import api_view
// from rest_framework.authtoken.models import Token
// from django.contrib.auth.models import User
// from django.contrib.auth import authenticate
// from rest_framework.permissions import IsAuthenticated
// from django.contrib.auth.models import User
// from .serializers import UserSerializer
// from rest_framework.views import APIView

// class APiListView(viewsets.ModelViewSet):
//     queryset = Api.objects.all()
//     serializer_class = ApiSerializer
//     filter_backends = [filters.SearchFilter]  # Thêm SearchFilter để hỗ trợ tìm kiếm
//     search_fields = ['title', 'brand', 'description']  # Các trường bạn muốn tìm kiếm

// class CategoryListView(viewsets.ModelViewSet):
//     queryset = Category.objects.all()
//     serializer_class = CategorySerializer

// @api_view(['POST'])
// def register(request):
//     username = request.data.get('username')
//     password = request.data.get('password')
//     email = request.data.get('email')
    
//     if User.objects.filter(username=username).exists():
//         return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

//     user = User.objects.create_user(username=username, password=password, email=email)
//     token, created = Token.objects.get_or_create(user=user)
//     return Response({'token': token.key}, status=status.HTTP_201_CREATED)

// @api_view(['POST'])
// def login(request):
//     username = request.data.get('username')
//     password = request.data.get('password')
//     user = authenticate(username=username, password=password)
    
//     if user is not None:
//         token, created = Token.objects.get_or_create(user=user)
//         return Response({'token': token.key}, status=status.HTTP_200_OK)
//     else:
//         return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)

// class UserListView(viewsets.ReadOnlyModelViewSet):
//     queryset = User.objects.all()
//     serializer_class = UserSerializer
//     permission_classes = [IsAuthenticated]  # Chỉ cho phép người dùng đã xác thực truy cập

// class UserProfileView(APIView):
//     permission_classes = [IsAuthenticated]

//     def get(self, request):
//         # Trả về dữ liệu của người dùng hiện tại
//         serializer = UserSerializer(request.user)
//         return Response(serializer.data)

// backend/url:
// from django.contrib import admin
// from django.urls import path, include
// from rest_framework import routers
// from api import views
// from django.conf import settings
// from django.conf.urls.static import static

// router = routers.DefaultRouter()
// router.register(r'products', views.APiListView, basename='product')
// router.register(r'categories', views.CategoryListView, basename='category')

// urlpatterns = [
//     path('admin/', admin.site.urls),
//     path('api/', include(router.urls)),  # Đường dẫn cho các API viewsets
//     path('auth/', include('api.urls')),  # Đường dẫn cho các API xác thực và người dùng
// ]

// # Serve media files during development
// urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


// về frontend
// thì profile nằm ở phần header:
// import React, { useState } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import "./style.css";

// function Header() {
//   const location = useLocation();
//   const currentPath = location.pathname;
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const navigate = useNavigate();

//   const handleSearch = (e) => {
//     e.preventDefault();
//     if (searchQuery) {
//       navigate(/search?q=${searchQuery});
//     }
//   };

//   const handleLogout = () => {
//     // Clear token and other user data from storage
//     localStorage.removeItem('token'); 
//     // Reload the page to prevent re-login
//     window.location.reload();
//   };

//   const toggleDropdown = () => {
//     setIsDropdownOpen(!isDropdownOpen);
//   };

//   return (
//     <header className="header-top">
//       <img className="logo" alt="Logo" src="../../../logo.jpg" />
//       <form className="search-field" onSubmit={handleSearch}>
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           fill="none"
//           viewBox="0 0 24 24"
//           strokeWidth="1.5"
//           stroke="currentColor"
//           className="icon-search"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
//           />
//         </svg>
//         <input
//           className="search-input"
//           type="text"
//           placeholder="Search"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />
//       </form>
//       <div className="navbar">
//         <Link
//           to="/"
//           className={nav-item ${currentPath === '/' ? 'active' : ''}}
//         >
//           Home
//         </Link>
//         <Link
//           to="/about"
//           className={nav-item ${currentPath === '/about' ? 'active' : ''}}
//         >
//           About
//         </Link>
//         <Link
//           to="/contact"
//           className={nav-item ${currentPath === '/contact' ? 'active' : ''}}
//         >
//           Contact Us
//         </Link>
//         <Link
//           to="/blog"
//           className={nav-item ${currentPath === '/blog' ? 'active' : ''}}
//         >
//           Blog
//         </Link>
//       </div>
//       <div className="icons">
//         <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
//           <path d="M11 7C8.239 7 6 9.216 6 11.95C6 14.157 6.875 19.395 15.488 24.69C15.6423 24.7839 15.8194 24.8335 16 24.8335C16.1806 24.8335 16.3577 24.7839 16.512 24.69C25.125 19.395 26 14.157 26 11.95C26 9.216 23.761 7 21 7C18.239 7 16 10 16 10C16 10 13.761 7 11 7Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//         </svg>
//         <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
//           <path d="M3 5H7L10 22H26M10 16.6667H25.59C25.7056 16.6667 25.8177 16.6267 25.9072 16.5535C25.9966 16.4802 26.0579 16.3782 26.0806 16.2648L27.8806 7.26479C27.8951 7.19222 27.8934 7.11733 27.8755 7.04552C27.8575 6.97372 27.8239 6.90679 27.7769 6.84956C27.73 6.79234 27.6709 6.74625 27.604 6.71462C27.5371 6.68299 27.464 6.66662 27.39 6.66667H8M12 26C12 26.5523 11.5523 27 11 27C10.4477 27 10 26.5523 10 26C10 25.4477 10.4477 25 11 25C11.5523 25 12 25.4477 12 26ZM26 26C26 26.5523 25.5523 27 25 27C24.4477 27 24 26.5523 24 26C24 25.4477 24.4477 25 25 25C25.5523 25 26 25.4477 26 26Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//         </svg>
//         <div className="profile-dropdown">
//           <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
//             <path d="M24 27V24.3333C24 22.9188 23.5224 21.5623 22.6722 20.5621C21.8221 19.5619 20.669 19 19.4667 19H11.5333C10.331 19 9.17795 19.5619 8.32778 20.5621C7.47762 21.5623 7 22.9188 7 24.3333V27M21 9.5C21 11.9853 18.9853 14 16.5 14C14.0147 14 12 11.9853 12 9.5C12 7.01472 14.0147 5 16.5 5C18.9853 5 21 7.01472 21 9.5Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//           </svg>
//           <div className="dropdown-menu">
//             <Link to="/profile" className="dropdown-item">Tài Khoản Của Tôi</Link>
//             <Link to="/orders" className="dropdown-item">Đơn Mua</Link>
//             <div className="dropdown-item" onClick={handleLogout}>Đăng Xuất</div>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }

// export default Header;

import React, { useState, useEffect } from "react";
import axios from "axios";

function UserProfile() {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    profile: {
      date_of_birth: "",
      gender: "",
      phone_number: "",
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("http://127.0.0.1:8000/auth/profile/", {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      console.log('Dữ liệu phản hồi API:', response.data);
      // Cập nhật dữ liệu nếu có profile, nếu không thì giữ nguyên giá trị mặc định
      setUserData(prevState => ({
        ...prevState,
        ...response.data,
        profile: response.data.profile || prevState.profile,
      }));
      setLoading(false);
    })
    .catch(error => {
      console.error('Lỗi API:', error);
      setError(error);
      setLoading(false);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevState => ({
      ...prevState,
      profile: {
        ...prevState.profile,
        [name]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put("http://127.0.0.1:8000/auth/profile/", userData, {
      headers: {
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
    .then(response => {
      alert("Cập nhật hồ sơ thành công!");
    })
    .catch(error => {
      console.log(error);
    });
  };
  

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (error) {
    return <div>Lỗi khi tải hồ sơ!</div>;
  }

  return (
    <div>
      <h2>Hồ sơ</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Tên đăng nhập:</label>
          <input
            type="text"
            value={userData.username}
            disabled
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={userData.email}
            disabled
          />
        </div>
        <div>
          <label>Ngày sinh:</label>
          <input
            type="date"
            name="date_of_birth"
            value={userData.profile.date_of_birth || ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Giới tính:</label>
          <select
            name="gender"
            value={userData.profile.gender || ""}
            onChange={handleChange}
          >
            <option value="">Chọn</option>
            <option value="Male">Nam</option>
            <option value="Female">Nữ</option>
          </select>
        </div>
        <div>
          <label>Số điện thoại:</label>
          <input
            type="text"
            name="phone_number"
            value={userData.profile.phone_number || ""}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Cập nhật hồ sơ</button>
      </form>
    </div>
  );
}

export default UserProfile;
