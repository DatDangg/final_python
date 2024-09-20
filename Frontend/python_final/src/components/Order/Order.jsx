import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function Order() {
  const { orderId } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
    console.log(orderData)
  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/orders/${orderId}/`, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then(response => {
      setOrderData(response.data);
      setLoading(false);
    })
    .catch(error => {
      setError(error);
      setLoading(false);
    });
  }, [orderId, token]);

  if (loading) {
    return <div>Đang tải chi tiết đơn hàng...</div>;
  }

  if (error) {
    return <div>Lỗi khi tải chi tiết đơn hàng!</div>;
  }

  return (
    <div className="order-details">
      <h2>Chi tiết đơn hàng {orderId}</h2>
      <p>Tên người nhận: {orderData.full_name}</p>
      <p>Số điện thoại: {orderData.phone_number}</p>
      <p>Địa chỉ: {orderData.address}</p>
      <p>Tổng tiền: {orderData.total_price} VND</p>
      <p>Phương thức thanh toán: {orderData.payment_method}</p>
      <p>Trạng thái: {orderData.status}</p>
      <h3>Sản phẩm</h3>
      <ul>
        {orderData.items.map(item => (
          <li key={item.product}>
            {item.product} - Số lượng: {item.quantity} - Giá: {item.price} VND
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Order;
