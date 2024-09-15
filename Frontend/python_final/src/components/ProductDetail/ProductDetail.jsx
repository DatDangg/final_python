import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./style.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null); // Thêm trạng thái cho biến thể được chọn
  const token = localStorage.getItem("token");
  const [categoryName, setCategoryName] = useState(location.state?.categoryName || "Category");

  // Slides
  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  const slider1 = useRef(null);
  const slider2 = useRef(null);

  useEffect(() => {
    setNav1(slider1.current);
    setNav2(slider2.current);
  }, []);

  const settingsMain = {
    asNavFor: nav2,
    ref: slider1,
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    adaptiveHeight: true, // Điều chỉnh chiều cao tự động
  };

  const settingsThumbs = {
    asNavFor: nav1,
    ref: slider2,
    slidesToShow: 3,
    slidesToScroll: 1,
    focusOnSelect: true,
    centerMode: true,
    centerPadding: "0px",
    dots: true,
    infinite: true,
    arrows: false,
    vertical: true,
    adaptiveHeight: true, // Điều chỉnh chiều cao tự động
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
          },
        })
        .then((response) => {
          setReviews(response.data);
        })
        .catch((error) => console.error("Error fetching reviews:", error));
    } else {
      console.error("No token found");
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
    if (token) {
      if (!selectedVariant) {
        alert("Please select a variant before adding to cart.");
        return;
      }
      console.log(selectedVariant.id)
      // Kiểm tra số lượng sản phẩm trong kho
      if (selectedVariant.quantity <= 0) {
        alert("Sản phẩm đã hết hàng.");
        return;
      }
  
      const currentCartItem = cartItems.find(
        (item) => item.product.id === product.id && item.variant.id === selectedVariant.id // Check variant in condition
      );
  
      if (currentCartItem) {
        alert("This variant is already in your cart.");
      } else {
        axios
          .post(
            "http://127.0.0.1:8000/api/cart/",
            { product_id: product.id, variant_id: selectedVariant.id, quantity: 1 }, // Keep variant_id in payload
            {
              headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
              },
            }
          )
          .then((response) => {
            setCartItems([...cartItems, response.data]);  // Handle new variant response
            console.log("Product added to cart:", response.data);
          })
          .catch((error) => console.error("Error adding to cart:", error));
      }
    } else {
      console.error("No token found");
    }
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
              <li>
                {product.brand}
              </li>
              <li>{product.title}</li>
            </ul>
          </nav>
          {/*left*/}
          <div className="row">
            <div className="product-detail__top">
              <div className="product-detail__left col-md-6">
                <div className="product-main-image">
                  {product.images.length > 0 ? (
                      <>
                        <Slider {...settingsMain}>
                          {product.images.map((image, index) => (
                              <div key={index}>
                                <img
                                    className="card-img-top card-img"
                                    src={image.image}
                                    alt={`Slide ${index + 1}`}
                                    style={{maxWidth: "100%", height: "auto"}}
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
                <h1 className="product-title fw-bold">{product.title}</h1>
                <span className="brand p-0">Brand: {product.brand}</span>
                {/* Hiển thị giá của biến thể được chọn */}
                {selectedVariant && (
                    <p className="product-price pt-3">
                      <span className="current-price fw-bold">${selectedVariant.cost_price}</span>
                      <span className="original-price">${selectedVariant.listed_price}</span>
                    </p>
                )}

                {/* Dropdown cho biến thể */}
                <div className="variant-selector">
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
                {selectedVariant && (
                    <p className="product-storage">
                      <label>Storage: </label>
                      <span className="ml-5">{selectedVariant.storage}</span>
                    </p>
                )}

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
              <div className="col product-detail__bottom">
                <h2 className="fw-bold">Details</h2>
                <p className="pt-3">{product.description}</p>

                {/* Hiển thị chi tiết sản phẩm dựa trên category */}
                {product.phone_details && (
                    <ul className="product-specs">
                      <li>
                        <strong>CPU:</strong> {product.phone_details.cpu}
                      </li>
                      <li>
                        <strong>Main Camera:</strong> {product.phone_details.main_camera}
                      </li>
                      <li>
                        <strong>Front Camera:</strong> {product.phone_details.front_camera}
                      </li>
                      <li>
                        <strong>Battery Capacity:</strong> {product.phone_details.battery_capacity}
                      </li>
                      <li>
                        <strong>Screen Size:</strong> {product.phone_details.screen_size}
                      </li>
                      <li>
                        <strong>Refresh Rate:</strong> {product.phone_details.refresh_rate}
                      </li>
                      <li>
                        <strong>Pixel Density:</strong> {product.phone_details.pixel_density}
                      </li>
                      <li>
                        <strong>Screen Type:</strong> {product.phone_details.screen_type}
                      </li>
                    </ul>
                )}

                {product.computer_details && (
                    <ul className="product-specs">
                      <li>
                        <strong>Processor:</strong> {product.computer_details.processor}
                      </li>
                      <li>
                        <strong>RAM:</strong> {product.computer_details.ram}
                      </li>
                      <li>
                        <strong>Graphics Card:</strong> {product.computer_details.graphics_card}
                      </li>
                      <li>
                        <strong>Screen Size:</strong> {product.computer_details.screen_size}
                      </li>
                      <li>
                        <strong>Battery Life:</strong> {product.computer_details.battery_life}
                      </li>
                    </ul>
                )}

                {product.headphone_details && (
                    <ul className="product-specs">
                      <li>
                        <strong>Wireless:</strong> {product.headphone_details.wireless ? "Yes" : "No"}
                      </li>
                      <li>
                        <strong>Battery Life:</strong> {product.headphone_details.battery_life}
                      </li>
                      <li>
                        <strong>Noise
                          Cancellation:</strong> {product.headphone_details.noise_cancellation ? "Yes" : "No"}
                      </li>
                      <li>
                        <strong>Driver Size:</strong> {product.headphone_details.driver_size}
                      </li>
                    </ul>
                )}

                {product.smartwatch_details && (
                    <ul className="product-specs">
                      <li>
                        <strong>Strap Type:</strong> {product.smartwatch_details.strap_type}
                      </li>
                      <li>
                        <strong>Screen Size:</strong> {product.smartwatch_details.screen_size}
                      </li>
                      <li>
                        <strong>Battery Capacity:</strong> {product.smartwatch_details.battery_capacity}
                      </li>
                      <li>
                        <strong>Water Resistance:</strong> {product.smartwatch_details.water_resistance ? "Yes" : "No"}
                      </li>
                      <li>
                        <strong>Heart Rate
                          Monitor:</strong> {product.smartwatch_details.heart_rate_monitor ? "Yes" : "No"}
                      </li>
                    </ul>
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
                          <p>Mã đơn hàng: {review.id}</p>
                          <strong>{review.user.username}</strong>
                          <div>
                            {[...Array(review.rating)].map((_, i) => (
                                <img
                                    key={i}
                                    src="https://salt.tikicdn.com/ts/upload/e3/f0/86/efd76e1d41c00ad8ebb7287c66b559fd.png"
                                    alt={`${review.rating} stars`}
                                    style={{ width: '20px', height: '20px', marginRight: '5px' }}
                                />
                            ))}
                            rated {review.rating} stars
                          </div>
                          <p className="pt-3">{review.comment}</p>
                          <small>{new Date(review.created_at).toLocaleDateString()}</small>
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
