import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import './style.css';

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
  const [selectedOrder, setSelectedOrder] = useState(null); 
  const [ratings, setRatings] = useState({}); 
  const [comments, setComments] = useState({}); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const formatPrice = (number) => {
    const integerPart = Math.floor(number);
    return integerPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("http://localhost:8000/api/orders/", {
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


  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("http://localhost:8000/auth/profile/", {
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
          }));
          setLoading(false);
        })
        .catch(error => {
          setError(error);
          setLoading(false);
        });
  }, []);

  const fetchProductDetails = (productId) => {
    const token = localStorage.getItem("token");
    return axios.get(`http://localhost:8000/api/products/${productId}/`, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
    }).then(response => {
      const product = response.data;
  
      const primaryImage = product.images.find(img => img.is_primary) || {}; 

      return {
        ...product,
        image_url: primaryImage.image || '', 
      };
    })
    .catch(error => {
      console.error('Error fetching product details:', error);
    });
  };
  

  const fetchOrderReviews = async (orderId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`http://localhost:8000/reviews/order/${orderId}/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching reviews for order:', orderId, error);
      return [];
    }
  };

  const handleOrderClick = async (order, orderIndex) => {
    const reviews = await fetchOrderReviews(order.id);
  
    const updatedItems = await Promise.all(order.items.map(async (item) => {
      const productDetails = await fetchProductDetails(item.product); // Lấy chi tiết sản phẩm từ API
  
      const hasReviewed = reviews.some(review => review.product === item.product);
  
      return {
        ...item,
        product_name: productDetails.title,
        product_image: productDetails.image_url, // Gán đúng URL của ảnh chính cho sản phẩm
        hasReviewed: hasReviewed,
      };
    }));
  
    setSelectedOrder({
      ...order,
      items: updatedItems,
      orderIndex: orderIndex + 1,
    });
  
    const orderModal = new window.bootstrap.Modal(document.getElementById('orderModal'));
    orderModal.show(); // Hiển thị modal sau khi chọn đơn hàng
  };
  

  const handleCancelOrder = (orderId) => {
    const token = localStorage.getItem("token");
  
    axios.put(`http://localhost:8000/orders/${orderId}/cancel/`, {}, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      setSelectedOrder(prevOrder => ({
        ...prevOrder,
        status: 'Cancelled'
      }));
  
      alert("Đơn hàng đã được hủy thành công!");

      const orderModal = window.bootstrap.Modal.getInstance(document.getElementById('orderModal'));
      orderModal.hide();
  
      setUserData(prevData => ({
        ...prevData,
        orders: prevData.orders.map(order => 
          order.id === orderId ? { ...order, status: 'Cancelled' } : order
        )
      }));
    })
    .catch(error => {
      console.error("Error cancelling order:", error);
      alert("Lỗi khi hủy đơn hàng. Vui lòng thử lại sau.");
    });
  };
  

  const handleRatingChange = (productId, value) => {
    setRatings(prevRatings => ({
      ...prevRatings,
      [productId]: value,
    }));
  };

  const handleCommentChange = (productId, value) => {
    setComments(prevComments => ({
      ...prevComments,
      [productId]: value,
    }));
  };

  const handleReviewSubmit = (productId, orderId) => {
    const token = localStorage.getItem("token");
    const payload = {
      product: productId,
      order: orderId,
      rating: ratings[productId],
      comment: comments[productId],
    };

    axios.post("http://localhost:8000/api/reviews/", payload, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then(response => {
        alert("Review submitted successfully");
      })
      .catch(error => {
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
    axios.put("http://localhost:8000/auth/profile/", userData, {
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
            </ul>

            <div className="tab-content" id="pills-tabContent">
              {/* Hồ sơ */}
              <div className="tab-pane fade show active" id="pills-home" role="tabpanel"
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
                    <input className="box"
                           type="text"
                           name="phone_number"
                           value={userData.profile.phone_number || ""}
                           onChange={handleChange}
                    />
                  </div>
                  <div className="pt-5 submit gap-3">
                    <button className="btn btn-outline-dark" type="submit">Cập nhật hồ sơ</button>
                    <Link to="/change-password" className="btn btn-outline-dark">
                      Đổi mật khẩu
                    </Link>
                  </div>
                </form>
              </div>

              {/* Thông tin đơn hàng */}
              <div className="tab-pane fade" id="pills-profile" role="tabpanel"
                   aria-labelledby="pills-profile-tab">
                <div className="order-list mb-4">
                  {userData.orders.length > 0 ? (
                    <div>
                      <table className="table table-custom">
                        <thead className="thead-dark text-white">
                        <tr className="text-uppercase">
                          <th scope="col">STT</th>
                          <th scope="col">Tên khách hàng</th>
                          <th scope="col">Tổng tiền</th>
                          <th scope="col">Trạng thái</th>
                        </tr>
                        </thead>
                        <tbody>
                          {userData.orders.map((order, index) => (
                            <tr key={order.id} onClick={() => handleOrderClick(order, index)}>
                              <th scope="row">Đơn hàng {index + 1}</th>
                              <td>{order.full_name}</td>
                              <td>{formatPrice(Number(order.total_price).toFixed(0))}đ</td>
                              <td>{order.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="no-orders">Bạn chưa có đơn hàng nào!</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal chi tiết đơn hàng */}
        <div className="modal fade" id="orderModal" tabIndex="-1" aria-labelledby="orderModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="orderModalLabel">Chi tiết đơn hàng</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                {selectedOrder && (
                  <div>
                    <div className="border-bottom">
                      <p><strong>Ngày mua:</strong> {new Date(selectedOrder.order_time).toISOString().split('T')[0]}</p>
                      <p><strong>Mã đơn hàng:</strong> {selectedOrder.id}</p>
                      <p><strong>Tổng tiền:</strong> {formatPrice(Number(selectedOrder.total_price).toFixed(0))}đ</p>
                      <p><strong>Phương thức thanh toán:</strong> {selectedOrder.payment_method}</p>
                    </div>
                    <div className="pt-3">
                      <p><strong>Họ và tên người mua:</strong> {selectedOrder.full_name}</p>
                      <p><strong>Địa chỉ giao hàng:</strong> {selectedOrder.address}</p>
                      <p><strong>Số điện thoại:</strong> {selectedOrder.phone_number}</p>
                      <p><strong>Trạng thái đơn hàng:</strong> <a className="text-danger fw-bold">{selectedOrder.status}</a></p>
                    </div>

                    {selectedOrder.status !== 'Cancelled' && selectedOrder.status !== 'Delivered' && selectedOrder.status !== 'Shipped' &&(
                        <button
                            className="btn btn-danger mt-1 mb-3"
                            onClick={() => handleCancelOrder(selectedOrder.id)}
                        >
                            Hủy đơn hàng
                        </button>
                    )}
                    <div className="container">
                      <div className="row">
                        <h5 className="border-top pt-3">Các mặt hàng:</h5>
                        <ul>
                          {selectedOrder.items.map(item => (
                              <li key={item.product} className="d-flex align-items-center mb-3">
                                <div className="col d-flex justify-content-center">
                                  <img
                                      src={item.product_image}
                                      alt={item.product_name}
                                      className="product-image me-3"
                                      style={{width: '80px', height: '80px', objectFit: 'cover'}}
                                  />
                                </div>
                                <div className="col">
                                  <div className="flex-grow-1">
                                    <p><strong>{item.product_name}</strong></p>
                                  </div>
                                  <div>
                                    <p>Số lượng: {item.quantity}</p>
                                  </div>
                                  <div className="">
                                    <p>Tổng: {formatPrice(item.price * item.quantity)}đ</p>
                                  </div>
                                </div>
                                <div className="col">
                                  {/* Phần đánh giá sản phẩm */}
                                  <div className="ms-3">
                                    {item.hasReviewed ? (
                                        <div className="alert alert-info">Sản phẩm này đã được đánh giá</div>
                                    ) : (
                                        <>
                                          <select
                                              name="rating"
                                              value={ratings[item.product] || 0}
                                              onChange={(e) => handleRatingChange(item.product, Number(e.target.value))}
                                              className="form-select mb-2"
                                          >
                                            <option value="0">Đánh giá từ 1 - 5</option>
                                            {[1, 2, 3, 4, 5].map((value) => (
                                                <option key={value} value={value}>{value}</option>
                                            ))}
                                          </select>
                                          <textarea
                                              className="form-control mb-2 w-100"
                                              placeholder="Viết đánh giá"
                                              value={comments[item.product] || ""}
                                              onChange={(e) => handleCommentChange(item.product, e.target.value)}
                                          />
                                          <button
                                              className="btn btn-primary"
                                              onClick={() => handleReviewSubmit(item.product, selectedOrder.id)}
                                          >
                                            Gửi đánh giá
                                          </button>
                                        </>
                                    )}
                                  </div>
                                </div>
                              </li>
                          ))}
                        </ul>

                      </div>
                    </div>

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
