import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './style.css'

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
  const [selectedOrder, setSelectedOrder] = useState(null); // State để lưu đơn hàng được chọn
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
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

  const handleOrderClick = (order) => {
    setSelectedOrder(order); // Khi chọn một đơn hàng, lưu đơn hàng đó vào state selectedOrder
  };

  const handleReviewSubmit = (productId) => {
    const token = localStorage.getItem("token");
    const payload = {
      product: productId,  // Ensure this is just the ID
      rating: rating,
      comment: comment,
    };
  
    console.log("Payload being sent:", payload);  // Debug log to inspect the payload
  
    axios.post("http://127.0.0.1:8000/api/reviews/", payload, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then(response => {
      alert("Review submitted successfully");
      setSelectedOrder(null); // After submitting the review, return to the order list
    })
    .catch(error => {
      if (error.response) {
        console.error("Error response data:", error.response.data);
      } else {
        console.error("Error submitting review:", error.message);
      }
      alert("Error submitting review");
    });
  };
  

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
    <div className="user">
      <div className="container">
        <div className="row">
          <div className="col pt-4">
            <h2 className="text-start">Hồ sơ</h2>
            <form onSubmit={handleSubmit}>
              <div className="pt-3">
                <label className="col-2 gap-3">Tên đăng nhập:</label>
                <input className="col-3"
                    type="text"
                    value={userData.username}
                    disabled
                />
              </div>
              <div className="pt-3">
                <label className="col-2">Email:</label>
                <input className="col-3"
                    type="email"
                    value={userData.email}
                    disabled
                />
              </div>
              <div className="pt-3">
                <label className="col-2">Ngày sinh:</label>
                <input className="col-3"
                    type="date"
                    name="date_of_birth"
                    value={userData.profile.date_of_birth || ""}
                    onChange={handleChange}
                />
              </div>
              <div className="pt-3">
                <label className="col-2">Giới tính:</label>
                <select className="col-3"
                    name="gender"
                    value={userData.profile.gender || ""}
                    onChange={handleChange}
                >
                  <option value="">Chọn</option>
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                </select>
              </div>
              <div className="pt-3">
                <label className="col-2">Số điện thoại:</label>
                <input className="col-3"
                    type="text"
                    name="phone_number"
                    value={userData.profile.phone_number || ""}
                    onChange={handleChange}
                />
              </div>
              <div className="pt-3">
                <button type="submit">Cập nhật hồ sơ</button>
              </div>
            </form>

            <h2 className="pt-5">Thông tin đơn hàng</h2>
            <div className="order-list">
              {userData.orders.length > 0 ? (
                  userData.orders.map(order => (
                      <div key={order.id} className="order-item" onClick={() => handleOrderClick(order)}>
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
        </div>
      </div>


      {selectedOrder && (
          <div className="review-section">
            <h3>Đánh giá sản phẩm trong đơn hàng {selectedOrder.id}</h3>
            {selectedOrder.items.map(item => {
              console.log("Item structure:", item);  // Log the entire item object
              return (
                  <div key={item.id}>
                    <p>Sản phẩm: {item.product.title}</p>
                    <label>Đánh giá (1-5): </label>
                    <input
                        type="number"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        max="5"
                        min="1"
                    />
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Viết đánh giá của bạn ở đây"
                    />
                    <button onClick={() => handleReviewSubmit(item.product)}>Gửi đánh giá</button>
                  </div>
              );
            })}


            <button onClick={() => setSelectedOrder(null)}>Quay lại</button>
          </div>
      )}
    </div>
  );
}

export default UserProfile;
