import React, { useState, useEffect, useRef, useContext  } from "react";
import { useParams, Link } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import axios from "axios";
import "./style.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [selectedImage, setSelectedImage] = useState("");
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  // const [cartItems, setCartItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null); // Thêm trạng thái cho biến thể được chọn
  const token = localStorage.getItem("token");
  const [categoryName, setCategoryName] = useState(location.state?.categoryName || "Category");
  const { cartItems, setCartItems, addToCart } = useContext(CartContext);
  // Slides
  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  const slider1 = useRef(null);
  const slider2 = useRef(null);

  useEffect(() => {
    // Set liên kết giữa các slider
    setNav1(slider1.current);
    setNav2(slider2.current);
  }, []);

  // Thiết lập cho slider chính (ảnh lớn)
  const settingsMain = {
    asNavFor: nav2,           // Liên kết với slider thumbnail
    dots: false,              // Không hiển thị chấm chỉ thị
    infinite: true,           // Vòng lặp vô tận
    speed: 500,               // Tốc độ chuyển slide
    slidesToShow: 1,          // Hiển thị 1 slide tại một thời điểm
    slidesToScroll: 1,        // Cuộn 1 slide mỗi lần
    autoplay: true,           // Tự động chuyển slide
    autoplaySpeed: 3000,      // Thời gian giữa các slide
    arrows: false,            // Không hiển thị mũi tên điều hướng
    adaptiveHeight: true,     // Tự động điều chỉnh chiều cao theo nội dung
  };

  // Thiết lập cho slider ảnh thu nhỏ
  const settingsThumbs = {
    asNavFor: nav1,           // Liên kết với slider chính
    slidesToShow: 4,          // Hiển thị 4 ảnh thu nhỏ
    slidesToScroll: 1,        // Cuộn 1 ảnh mỗi lần
    focusOnSelect: true,      // Chọn ảnh thu nhỏ để chuyển ảnh chính
    centerMode: true,         // Canh giữa các ảnh thu nhỏ
    centerPadding: "0px",     // Không có padding
    dots: true,               // Hiển thị các chấm chỉ thị cho ảnh thu nhỏ
    infinite: true,           // Vòng lặp vô tận
    arrows: false,            // Không hiển thị mũi tên điều hướng
    vertical: false,          // Đặt chiều ngang cho ảnh thu nhỏ
    adaptiveHeight: true,     // Tự động điều chỉnh chiều cao
  };


  useEffect(() => {
    if (token) {
      axios
        .get(`http://127.0.0.1:8000/api/products/${id}/`)
        .then((response) => {
          const fetchedProduct = response.data;
          setProduct(fetchedProduct);
          
          if (!location.state?.categoryName) {
            fetch(`http://127.0.0.1:8000/api/categories/${fetchedProduct.category}/`)
              .then((response) => response.json())
              .then((data) => {
                setCategoryName(data.name);
              })
              .catch((error) => console.error('Error fetching category name:', error));
          }

          // Set biến thể đầu tiên làm mặc định nếu có
          if (fetchedProduct.variants && fetchedProduct.variants.length > 0) {
            setSelectedVariant(fetchedProduct.variants[0]);
          }
  
          // Set the primary image as the default selected image
          const primaryImage = fetchedProduct.images.find((img) => img.is_primary);
          if (primaryImage) {
            setSelectedImage(primaryImage.image);
          } else if (fetchedProduct.images.length > 0) {
            setSelectedImage(fetchedProduct.images[0].image); // Fallback to the first image
          }
        })
        .catch((error) => console.error("Error fetching product:", error));
  
      axios
        .get("http://127.0.0.1:8000/api/cart/", {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          setCartItems(response.data);
        })
        .catch((error) => console.error("Error fetching cart items:", error));

      axios
        .get(`http://127.0.0.1:8000/wishlist/${id}/`, {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          setIsInWishlist(response.data.is_in_wishlist);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching wishlist status:", error);
          setLoading(false);
        });
  
        axios
        .get(`http://127.0.0.1:8000/api/reviews/?product_id=${id}`, {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          setReviews(response.data);

          const userIds = response.data.map((review) => review.user);

          userIds.forEach((userId) => {
            axios
              .get(`http://127.0.0.1:8000/auth/users/${userId}/`, {
                headers: {
                  Authorization: `Token ${token}`,
                },
              })
              .then((userResponse) => {
                setUserDetails((prevDetails) => ({
                  ...prevDetails,
                  [userId]: userResponse.data.username, 
                }));
              })
              .catch((error) =>
                console.error(`Error fetching user with ID ${userId}:`, error)
              );
          });
        })
        .catch((error) => console.error("Error fetching reviews:", error));
      }
  }, [id, token]);
  
  

  const handleWishlistClick = () => {
    axios
      .post(
        `http://127.0.0.1:8000/wishlist/${id}/toggle/`,
        {},
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        setIsInWishlist(response.data.is_in_wishlist);
        if (response.data.is_in_wishlist) {
          console.log("Product added to wishlist.");
        } else {
          console.log("Product removed from wishlist.");
        }
      })
      .catch((error) => console.error("Error toggling wishlist:", error));
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      alert("Please select a variant before adding to cart.");
      return;
    }
  
    const availableQuantity = selectedVariant.quantity;
    const currentCartItem = cartItems.find(
      (item) => item.product.id === product.id && item.variant.id === selectedVariant.id
    );
  
    const currentCartQuantity = currentCartItem ? currentCartItem.quantity : 0;
    const newQuantity = currentCartQuantity + 1;
  
    if (newQuantity > availableQuantity) {
      alert("Số lượng sản phẩm trong giỏ hàng đã đạt tối đa");
      return;
    }
  
    // Cập nhật giỏ hàng trên giao diện trước khi gọi API
    addToCart(product.id, selectedVariant.id, 1);
  };
  

  
  // Cập nhật variant khi người dùng thay đổi
  const handleVariantChange = (variantId) => {
    const variant = product.variants.find((v) => v.id === parseInt(variantId));
    setSelectedVariant(variant);
  };

  if (!product || !product.images) {
    return <div>Loading...</div>;
  }
  return (
      <div className="product-detail">
        <div className="container">
          <nav className="breadcrumb">
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to={`/category/${product.category}`}>
                  {categoryName}
                </Link>
              </li>
              <li>{product.title}</li>
            </ul>
          </nav>
          {/*left*/}
          <div className="row w-100">
            <div className="product-detail__top p-0 m-0">
              <div className="product-detail__left col-md-6">
                <div className="product-main-image justify-content-center align-items-center">
                  {product.images.length > 0 ? (
                      <>
                        <Slider className="main-slider" {...settingsMain} ref={(slider) => setNav1(slider)}>
                          {product.images.map((image, index) => (
                              <div key={index}>
                                <img
                                    className="card-img-top card-img max-height"
                                    src={image.image}
                                    alt={`Slide ${index + 1}`}
                                    style={{ maxWidth: "100%", height: "auto" }}
                                />
                              </div>
                          ))}
                        </Slider>
                        {/* Slider ảnh thu nhỏ */}
                        <Slider {...settingsThumbs} ref={slider2} className="thumbnail-slider">
                          {product.images.map((image, index) => (
                              <div key={index}>
                                <img
                                    className="thumbnail-img"
                                    src={image.image}
                                    alt={`Thumbnail ${index + 1}`}
                                />
                              </div>
                          ))}
                        </Slider>
                      </>
                  ) : (
                      <img
                          className="product-image"
                          src={selectedImage}
                          alt={product.title}
                      />
                  )}
                </div>
              </div>
              {/*right*/}
              <div className="product-detail__right col-md-6 pt-3">
                <a className="title fw-bold">{product.title}</a>
                <p className="brand p-0 mb-1">Brand: {product.brand}</p>
                {/* Hiển thị giá của biến thể được chọn */}
                {selectedVariant && (
                    <p className="product-price pt-1">
                      <span className="current-price fw-bold"><>đ</>{Number(selectedVariant.cost_price).toFixed(0)}</span>
                      <span className="original-price"><>đ</>{Number(selectedVariant.listed_price).toFixed(0)}</span>
                    </p>
                )}

                {/* Dropdown cho biến thể */}
                <div className="variant-selector mb-4">
                  <label>Choose Variant: </label>
                  <select className="btn btn-outline-light text-black"
                          value={selectedVariant ? selectedVariant.id : ""}
                          onChange={(e) => handleVariantChange(e.target.value)}
                  >
                    {product.variants.map((variant) => (
                        <option key={variant.id} value={variant.id}>
                          {variant.color} - {variant.storage}
                        </option>
                    ))}
                  </select>
                </div>

                {/*product-value*/}
                <div className="product-value">
                  {/*smartphone*/}
                  {product.phone_details && (
                      <div className="container p-0 justify-content-between mb-4">
                        <div className="row ">
                          <div className="col-sm-4 d-flex border-bottom">
                            <div className="col-4 align-items-center pt-3 ml-2">
                              <img className="icon-value" src="/photos/Screensize.png" alt=""/>
                            </div>
                            <div className="col-8 pt-2">
                              <span className="ml-5">Screen Size</span>
                              <p className="ml-5 fw-bold">{product.phone_details.screen_size}</p>
                            </div>
                          </div>
                          <div className="col-sm-4 d-flex border-bottom">
                            <div className="col-4 align-items-center pt-3 ml-2">
                              <img className="icon-value" src="/photos/cpu.png" alt=""/>
                            </div>
                            <div className="col-8 pt-2">
                              <span className="ml-5">CPU</span>
                              <p className="ml-5 fw-bold">{product.phone_details.cpu}</p>
                            </div>

                          </div>
                          <div className="col-sm-4 d-flex border-bottom ">
                            <div className="col-4 align-items-center pt-3 ml-2">
                              <img className="icon-value" src="/photos/refresh.png" alt=""/>
                            </div>
                            <div className="col-8 pt-2">
                              <span className="ml-5">Refresh Rate</span>
                              <p className="ml-5 fw-bold">{product.phone_details.refresh_rate}</p>
                            </div>
                          </div>
                          <div className="col-sm-4 d-flex border-bottom ">
                            <div className="col-4 align-items-center pt-3 ml-2">
                              <img className="icon-value" src="/photos/main-camera.png" alt=""/>
                            </div>
                            <div className="col-8 pt-2">
                              <span className="ml-5">Main Camera</span>
                              <p className="ml-5 fw-bold">{product.phone_details.main_camera}</p>
                            </div>
                          </div>
                          <div className="col-sm-4 d-flex border-bottom">
                            <div className="col-4 align-items-center pt-3 ml-2">
                              <img className="icon-value" src="/photos/front-camera.png" alt=""/>
                            </div>
                            <div className="col-8 pt-2">
                              <span className="ml-5">Front Camera</span>
                              <p className="ml-5 fw-bold">{product.phone_details.front_camera}</p>
                            </div>
                          </div>
                          <div className="col-sm-4 d-flex border-bottom ">
                            <div className="col-4 align-items-center pt-3 ml-2">
                              <img className="icon-value" src="/photos/battery.png" alt=""/>
                            </div>
                            <div className="col-8 pt-2">
                              <span className="ml-5">Battery</span>
                              <p className="ml-5 fw-bold">{product.phone_details.battery_capacity}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                  )}
                  {/*headphone*/}
                  {product.computer_details && (
                      <div className="container p-0 justify-content-between mb-4">
                        <div className="row ">
                          <div className="col-sm-4 d-flex border-bottom">
                            <div className="col-4 align-items-center pt-3 ml-2">
                              <img className="icon-value" src="/photos/Screensize.png" alt=""/>
                            </div>
                            <div className="col-8 pt-2">
                              <span className="ml-5">Screen Size</span>
                              <p className="ml-5 fw-bold">{product.computer_details.screen_size}</p>
                            </div>
                          </div>
                          <div className="col-sm-4 d-flex border-bottom">
                            <div className="col-4 align-items-center pt-3 ml-2">
                              <img className="icon-value" src="/photos/cpu.png" alt=""/>
                            </div>
                            <div className="col-8 pt-2">
                              <span className="ml-5">RAM</span>
                              <p className="ml-5 fw-bold">{product.computer_details.ram}</p>
                            </div>

                          </div>
                        </div>
                      </div>

                  )}
                </div>

                {/*description*/}
                <div className="product-description">
                  <p className="fw-100">{product.description}</p>
                </div>

                <div className="product-actions pt-3">
                  <button
                      className="wishlist-button"
                      onClick={handleWishlistClick}
                      disabled={loading}
                  >
                    {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                  </button>
                  <button className="cart-button" onClick={handleAddToCart}>
                    Add to Cart
                  </button>
                </div>

                <div className="info pt-4">
                  <div className="container justify-content-between">
                    <div className="row">
                      <div className="col-md-4 d-flex">
                        <div className="col-4">
                          <img src="/photos/Delivery.png" alt=""/>
                        </div>
                        <div className="col-8">
                          <span className="ml-5">Free Delivery</span>
                          <p className="ml-5 fw-bold">1-2 day</p>
                        </div>
                      </div>
                      <div className="col-md-4 d-flex">
                        <div className="col-4">
                          <img src="/photos/Stock.png" alt=""/>
                        </div>
                        <div className="col-8">
                          <span className="ml-5">In Stock</span>
                          <p className="ml-5 fw-bold">Today</p>
                        </div>

                      </div>
                      <div className="col-md-4 d-flex">
                        <div className="col-4">
                          <img src="/photos/Guaranteed.png" alt=""/>
                        </div>
                        <div className="col-8">
                          <span className="ml-5">Guaranteed</span>
                          <p className="ml-5 fw-bold">1 year</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/*product-bottom-detail*/}
          <div className="container">
            <div className="row d-flex pt-5">
              <div className="col product-detail__bottom1">
                <h2 className="fw-bold">Details</h2>
                <p className="pt-3">{product.description}</p>

                {/* Hiển thị chi tiết sản phẩm dựa trên category */}
                {product.phone_details && (
                    <table className="table">
                      <tbody>
                      <tr>
                        <td><strong>CPU:</strong></td>
                        <td className="align-bottom">{product.phone_details.cpu}</td>
                      </tr>
                      <tr>
                        <td><strong>Main Camera:</strong></td>
                        <td className="align-bottom">{product.phone_details.main_camera}</td>
                      </tr>
                      <tr>
                        <td><strong>Front Camera:</strong></td>
                        <td className="align-bottom">{product.phone_details.front_camera}</td>
                      </tr>
                      <tr>
                        <td><strong>Battery Capacity:</strong></td>
                        <td className="align-bottom">{product.phone_details.battery_capacity}</td>
                      </tr>
                      <tr>
                        <td><strong>Screen Size:</strong></td>
                        <td className="align-bottom">{product.phone_details.screen_size}</td>
                      </tr>
                      <tr>
                        <td><strong>Refresh Rate:</strong></td>
                        <td className="align-bottom">{product.phone_details.refresh_rate}</td>
                      </tr>
                      <tr>
                        <td><strong>Pixel Density:</strong></td>
                        <td className="align-bottom">{product.phone_details.pixel_density}</td>
                      </tr>
                      <tr>
                        <td><strong>Screen Type:</strong></td>
                        <td className="align-bottom">{product.phone_details.screen_type}</td>
                      </tr>
                      </tbody>
                    </table>


                )}

                {product.computer_details && (
                    <table className="table">
                      <tbody>
                      <tr>
                        <td><strong>Processor:</strong></td>
                        <td>{product.computer_details.processor}</td>
                      </tr>
                      <tr>
                        <td><strong>RAM:</strong></td>
                        <td>{product.computer_details.ram}</td>
                      </tr>
                      <tr>
                        <td><strong>Graphics Card:</strong></td>
                        <td>{product.computer_details.graphics_card}</td>
                      </tr>
                      <tr>
                        <td><strong>Screen Size:</strong></td>
                        <td>{product.computer_details.screen_size}</td>
                      </tr>
                      <tr>
                        <td><strong>Battery Life:</strong></td>
                        <td>{product.computer_details.battery_life}</td>
                      </tr>
                      </tbody>
                    </table>
                )}

                {product.headphone_details && (
                    <table className="table">
                      <tbody>
                      <tr>
                        <td><strong>Wireless:</strong></td>
                        <td>{product.headphone_details.wireless ? "Yes" : "No"}</td>
                      </tr>
                      <tr>
                        <td><strong>Battery Life:</strong></td>
                        <td>{product.headphone_details.battery_life}</td>
                      </tr>
                      <tr>
                        <td><strong>Noise Cancellation:</strong></td>
                        <td>{product.headphone_details.noise_cancellation ? "Yes" : "No"}</td>
                      </tr>
                      <tr>
                        <td><strong>Driver Size:</strong></td>
                        <td>{product.headphone_details.driver_size}</td>
                      </tr>
                      </tbody>
                    </table>
                )}

                {product.smartwatch_details && (
                    <table className="table">
                      <tbody>
                      <tr>
                        <td><strong>Strap Type:</strong></td>
                        <td>{product.smartwatch_details.strap_type}</td>
                      </tr>
                      <tr>
                        <td><strong>Screen Size:</strong></td>
                        <td>{product.smartwatch_details.screen_size}</td>
                      </tr>
                      <tr>
                        <td><strong>Battery Capacity:</strong></td>
                        <td>{product.smartwatch_details.battery_capacity}</td>
                      </tr>
                      <tr>
                        <td><strong>Water Resistance:</strong></td>
                        <td>{product.smartwatch_details.water_resistance ? "Yes" : "No"}</td>
                      </tr>
                      <tr>
                        <td><strong>Heart Rate Monitor:</strong></td>
                        <td>{product.smartwatch_details.heart_rate_monitor ? "Yes" : "No"}</td>
                      </tr>
                      </tbody>
                    </table>
                )}
              </div>

            </div>

          </div>
        </div>

        {/*rating*/}
        <div className="container pt-5">
          <div className="row">
            <div className="col">
              <div className="product-detail__bottom">
                <h2 className="fw-bold">Customer Reviews</h2>
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review.id} className="border-bottom pt-3">
                          <p className="fw-bold text-primary">Người đánh giá: {userDetails[review.user]}</p>
                          <div>
                            {[...Array(review.rating)].map((_, i) => (
                                <img
                                    key={i}
                                    src="https://salt.tikicdn.com/ts/upload/e3/f0/86/efd76e1d41c00ad8ebb7287c66b559fd.png"
                                    alt={`${review.rating} stars`}
                                    style={{width: '20px', height: '20px', marginRight: '5px'}}
                                />
                            ))}
                            rated {review.rating} stars
                          </div>
                          <small>Ngày đánh giá: {new Date(review.created_at).toLocaleDateString()}</small>
                          <p className="pt-3">Comments: {review.comment}</p>
                        </div>
                    ))
                ) : (
                    <p>No reviews yet.</p>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
  );


}

export default ProductDetail;
