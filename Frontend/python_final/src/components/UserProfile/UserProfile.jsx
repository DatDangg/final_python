import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
  const [selectedOrder, setSelectedOrder] = useState(null); // State để lưu đơn hàng được chọn
  const [ratings, setRatings] = useState({}); // State cho rating của từng sản phẩm
  const [comments, setComments] = useState({}); // State cho comment của từng sản phẩm
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

  const fetchProductDetails = (productId) => {
    const token = localStorage.getItem("token");
    return axios.get(`http://127.0.0.1:8000/api/products/${productId}/`, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
    }).then(response => response.data)
      .catch(error => {
        console.error('Error fetching product details:', error);
      });
  };
  
  const fetchProductReviews = async (productId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/reviews/?product=${productId}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data; // Giả sử API trả về danh sách review của sản phẩm đó
    } catch (error) {
      console.error('Error fetching reviews for product:', productId, error);
      return [];
    }
  };

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

  const handleOrderClick = async (order) => {
    const updatedItems = await Promise.all(order.items.map(async (item) => {
      const productDetails = await fetchProductDetails(item.product);
      const reviews = await fetchProductReviews(item.product);
      const hasReviewed = reviews.some(review => review.user === userData.id);
      return {
        ...item,
        product_name: productDetails.title, 
        hasReviewed: hasReviewed,
      };
    }));
    
    // Cập nhật đơn hàng với thông tin sản phẩm mới
    setSelectedOrder({
      ...order,
      items: updatedItems,
    });
    
    document.getElementById('pills-contact-tab').click(); // Chuyển sang tab review
  };
  
  
  const handleReviewSubmit = (productId) => {
    const token = localStorage.getItem("token");
    const payload = {
      product: productId,  // Đảm bảo đây chỉ là ID
      rating: ratings[productId],
      comment: comments[productId],
    };

    console.log("Payload being sent:", payload);  // Debug log để kiểm tra payload
    axios.post("http://127.0.0.1:8000/api/reviews/", payload, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
        .then(response => {
          alert("Review submitted successfully");
          // setSelectedOrder(null); // Sau khi gửi đánh giá, quay lại danh sách đơn hàng
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

                {/*thông tin đơn hang*/}
                <div className="tab-pane fade" id="pills-profile" role="tabpanel"
                     aria-labelledby="pills-profile-tab">
                  <div className="order-list mb-4">
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
                                  <td>{order.id}</td>
                                  <td>{order.full_name}</td>
                                  <td>{order.total_price}đ</td>
                                  <td>{order.status}</td>
                                  <td>{order.payment_method}</td>
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

                {/* phần review */}
                <div className="tab-pane fade" id="pills-contact" role="tabpanel"
                     aria-labelledby="pills-contact-tab">
                  {selectedOrder ? (
                      <div className="review">
                        <div className="text-center">
                          <h2 className="mb-3">Đánh giá đơn hàng {selectedOrder.id} </h2>
                          {selectedOrder.items && selectedOrder.items.length > 0 ? (
                              selectedOrder.items.map((item) => (
                                  <div key={item.product} className="mb-4">
                                    <h4>Sản phẩm: {item.product_name || "Tên sản phẩm không có"}</h4>
                                    {item.hasReviewed ? (
                                      <div className="alert alert-info">Sản phẩm này đã được đánh giá</div>
                                    ) : (
                                      <>
                                        <div className="mb-3">
                                          <select
                                              name="rating"
                                              className="form-select mx-auto"
                                              style={{width: '50%'}}
                                              value={ratings[item.product] || 0}
                                              onChange={(e) => handleRatingChange(item.product, Number(e.target.value))}
                                          >
                                            <option value="0">Đánh giá từ 1 - 5</option>
                                            {[1, 2, 3, 4, 5].map((value) => (
                                                <option key={value} value={value}>{value}</option>
                                            ))}
                                          </select>
                                        </div>
                                        <div className="mb-3">
                                          <textarea
                                              id={`comment-${item.product}`}
                                              className="form-control mx-auto text-review"
                                              style={{width: '50%'}}
                                              value={comments[item.product] || ""}
                                              onChange={(e) => handleCommentChange(item.product, e.target.value)}
                                          />
                                        </div>
                                        <button
                                            className="btn btn-outline-dark mt-3 mb-5"
                                            onClick={() => handleReviewSubmit(item.product)}
                                        >
                                          Gửi đánh giá cho sản phẩm {item.product_name}
                                        </button>
                                      </>
                                    )}
                                  </div>
                              ))
                          ) : (
                              <div>Không có sản phẩm nào trong đơn hàng.</div>
                          )}
                        </div>
                      </div>
                  ) : (
                      <div>Vui lòng chọn một đơn hàng để xem chi tiết.</div>
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
