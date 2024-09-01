import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function UserProfile() {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    profile: {
      date_of_birth: "",
      gender: "",
      phone_number: "",
    },
    orders: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("http://127.0.0.1:8000/auth/profile/", {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      setUserData(prevState => ({
        ...prevState,
        ...response.data,
        profile: response.data.profile || prevState.profile,
        orders: response.data.orders || [],
      }));
      setLoading(false);
    })
    .catch(error => {
      setError(error);
      setLoading(false);
    });
  }, []);
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("http://127.0.0.1:8000/api/orders/", {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      // Check if the data contains the orders
      setUserData(prevState => ({
        ...prevState,
        orders: response.data || [],
      }));
      setLoading(false);
    })
    .catch(error => {
      console.error('Error fetching orders:', error);
      setError(error);
      setLoading(false);
    });
  }, []);
  

  const handleOrderClick = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (error) {
    return <div>Lỗi khi tải hồ sơ!</div>;
  }

  return (
    <div className="user">
      <h2>Hồ sơ</h2>
      <form>
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
            disabled
          />
        </div>
        <div>
          <label>Giới tính:</label>
          <select
            name="gender"
            value={userData.profile.gender || ""}
            disabled
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
            disabled
          />
        </div>
      </form>
      
      <h2>Thông tin đơn hàng</h2>
      <div className="order-list">
        {userData.orders.length > 0 ? (
          userData.orders.map(order => (
            <div key={order.id} className="order-item" onClick={() => handleOrderClick(order.id)}>
              <p>Mã đơn hàng: {order.id}</p>
              <p>Tổng tiền: {order.total_price} VND</p>
              <p>Trạng thái: {order.status}</p>
            </div>
          ))
        ) : (
          <p>Không có đơn hàng nào.</p>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
