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
  const token = localStorage.getItem("token");

  //slides
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

          // Set the primary image as the default selected image
          const primaryImage = fetchedProduct.images.find(
            (img) => img.is_primary
          );
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
      const currentCartItem = cartItems.find(
        (item) => item.product.id === product.id
      );

      if (currentCartItem) {
        alert("This product is already in your cart.");
      } else {
        axios
          .post(
            "http://127.0.0.1:8000/api/cart/",
            { product_id: id, quantity: 1 },
            {
              headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
              },
            }
          )
          .then((response) => {
            setCartItems([...cartItems, response.data]);
            console.log("Product added to cart:", response.data);
          })
          .catch((error) => console.error("Error adding to cart:", error));
      }
    } else {
      console.error("No token found");
    }
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
              <Link to={`/category/${product.category.id}`}>
                {product.category.name}
              </Link>
            </li>
            <li>
              <Link to="#">{product.brand}</Link>
            </li>
            <li>{product.title}</li>
          </ul>
        </nav>
        <div className="product-detail__top container">
          <div className="product-detail__left col-5">
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
                          style={{ maxWidth: "100%", height: "auto" }}
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
          <div className="product-detail__right col-7">
            <h1 className="product-title">{product.title}</h1>
            <p className="product-price">
              <span className="current-price">${product.cost_price}</span>
              <span className="original-price">${product.listed_price}</span>
            </p>
            <div className="product-actions">
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
          </div>
        </div>

        <div className="product-detail__bottom">
          <h2>Details</h2>
          <p>{product.description}</p>
          <ul className="product-specs">
            <li>
              <strong>Storage:</strong> {product.storage_product}
            </li>
            <li>
              <strong>CPU:</strong> {product.cpu}
            </li>
            <li>
              <strong>Main Camera:</strong> {product.MainCamera}
            </li>
            <li>
              <strong>Front Camera:</strong> {product.FrontCamera}
            </li>
            <li>
              <strong>Battery Capacity:</strong> {product.BatteryCapacity}
            </li>
            <li>
              <strong>Screen Size:</strong> {product.screen_size}
            </li>
            <li>
              <strong>Screen Refresh Rate:</strong>{" "}
              {product.screen_refresh_rate}
            </li>
            <li>
              <strong>Pixel:</strong> {product.pixel}
            </li>
            <li>
              <strong>Screen Type:</strong> {product.screen_type}
            </li>
          </ul>
          <h2>Customer Reviews</h2>
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id}>
                <strong>{review.user.username}</strong> rated {review.rating}{" "}
                stars
                <p>{review.comment}</p>
                <small>
                  {new Date(review.created_at).toLocaleDateString()}
                </small>
              </div>
            ))
          ) : (
            <p>No reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
