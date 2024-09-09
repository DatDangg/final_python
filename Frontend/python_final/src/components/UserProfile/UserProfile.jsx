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
    <div className="user p-5">
      <div className="container">
        <div className="row user1">
          <div className="col pt-4 align-item-center">
            <ul className="nav nav-pills mb-3" id="pills-tab" role="tablist">
              <li className="nav-item" role="presentation">
                <button className="nav-link active" id="pills-home-tab" data-bs-toggle="pill"
                        data-bs-target="#pills-home" type="button" role="tab" aria-controls="pills-home"
                        aria-selected="true"> Hồ sơ
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button className="nav-link" id="pills-profile-tab" data-bs-toggle="pill"
                        data-bs-target="#pills-profile" type="button" role="tab" aria-controls="pills-profile"
                        aria-selected="false"> Thông tin đơn hàng
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button className="nav-link" id="pills-contact-tab" data-bs-toggle="pill"
                        data-bs-target="#pills-contact" type="button" role="tab" aria-controls="pills-contact"
                        aria-selected="false"> Review
                </button>
              </li>
            </ul>
            <div className="tab-content" id="pills-tabContent">
              <div className="tab-pane fade show" id="pills-home" role="tabpanel"
                   aria-labelledby="pills-home-tab">
                <form onSubmit={handleSubmit}>
                  <div className="pt-2">
                    <label className="col-2 gap-3">Tên đăng nhập:</label>
                    <input className="col-3 box"
                           type="text"
                           value={userData.username}
                           disabled
                    />
                  </div>
                  <div className="pt-3">
                    <label className="col-2">Email:</label>
                    <input className="box"
                           type="email"
                           value={userData.email}
                           disabled
                    />
                  </div>
                  <div className="pt-3">
                    <label className="col-2">Ngày sinh:</label>
                    <input className="col-3 box"
                           type="date"
                           name="date_of_birth"
                           value={userData.profile.date_of_birth || ""}
                           onChange={handleChange}
                    />
                  </div>
                  <div className="pt-3">
                    <label className="col-2">Giới tính:</label>
                    <select className="col-3 box"
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
                    <input className=" box"
                           type="text"
                           name="phone_number"
                           value={userData.profile.phone_number || ""}
                           onChange={handleChange}
                    />
                  </div>
                  <div className="pt-5 submit">
                    <button className="btn btn-outline-dark" type="submit">Cập nhật hồ sơ</button>
                  </div>
                </form>
              </div>
              <div className="tab-pane fade" id="pills-profile" role="tabpanel"
                   aria-labelledby="pills-profile-tab">
                <div className="order-list">
                  {userData.orders.length > 0 ? (
                      <div>
                        <table className="table table-custom">
                          <thead className="thead-dark">
                          <tr className="text-uppercase">
                            <th scope="col">STT</th>
                            <th scope="col">Mã đơn hàng</th>
                            <th scope="col">Tên khách hàng</th>
                            <th scope="col">Tổng tiền</th>
                            <th scope="col">Trạng thái</th>
                            <th scope="col">Thanh toán</th>

                          </tr>
                          </thead>
                          <tbody>
                          {userData.orders.map((order, index) => (
                              <tr key={order.id} onClick={() => handleOrderClick(order)}>
                                <th scope="row">Đơn hàng {index + 1}</th>
                                {/* Thay đổi ở đây để hiển thị STT */}
                                <td>{order.id}</td>
                                <td>{order.full_name}</td>
                                <td>{order.total_price} ₫</td>
                                <td className="text-danger">{order.status}</td>
                                <td>{order.payment_method}</td>
                              </tr>
                          ))}
                          </tbody>
                        </table>
                      </div>
                  ) : (
                      <p>Không có đơn hàng nào.</p>
                  )}

                </div>
              </div>
              <div className="tab-pane fade" id="pills-contact" role="tabpanel"
                   aria-labelledby="pills-contact-tab">
                {selectedOrder && (
                    <div className="review-section text-center">
                      <h3>Đơn hàng {selectedOrder.id}</h3>
                      {selectedOrder.items.map(item => {
                        console.log("Item structure:", item);  // Log the entire item object
                        return (
                            <div key={item.id}>
                              <p className="pt-3 fs-10">Sản phẩm: {item.product.title}</p>
                              <label>Đánh giá (1-5): </label>
                              <input
                                  className=" m-3 btn btn-outline-dark"
                                  type="number"
                                  value={rating}
                                  onChange={(e) => setRating(e.target.value)}
                                  max="5"
                                  min="1"
                              />
                              <div className="review pt-3">
                                <textarea
                                    className="text-review"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Viết đánh giá của bạn ở đây"
                                />
                              </div>
                              <button className="m-3 btn btn-danger"
                                      onClick={() => handleReviewSubmit(item.product)}>Gửi đánh giá
                              </button>
                              <button className=" btn btn-danger" onClick={() => setSelectedOrder(null)}>Quay lại</button>

                            </div>
                        );
                      })}


                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>



    </div>
  );
}

export default UserProfile;
