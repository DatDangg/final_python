import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./style.css";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      axios
        .get(`http://127.0.0.1:8000/api/products/${id}/`)
        .then((response) => {
          setProduct(response.data);
          setSelectedImage(response.data.images);
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

  if (!product) {
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
        <div className="product-detail__top">
          <div className="product-detail__left">
            <div className="product-main-image">
              <img
                src={selectedImage}
                alt={product.title}
                className="product-image"
              />
            </div>
          </div>
          <div className="product-detail__right">
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
              <strong>Screen diagonal:</strong> 6.7"
            </li>
            <li>
              <strong>Resolution:</strong> 2796x1290
            </li>
            <li>
              <strong>Refresh rate:</strong> 120Hz
            </li>
            <li>
              <strong>Pixel density:</strong> 460ppi
            </li>
          </ul>
          <h2>Customer Reviews</h2>
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id}>
                <strong>{review.user.username}</strong> rated {review.rating} stars
                <p>{review.comment}</p>
                <small>{new Date(review.created_at).toLocaleDateString()}</small>
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
