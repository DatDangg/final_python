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
    } else {
      console.error("No token found");
    }
  }, [id, token]);

  useEffect(() => {
    if (token && product) {
      axios
        .get(`http://127.0.0.1:8000/wishlist/${id}/`, {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          setIsInWishlist(response.data.is_in_wishlist);
          setLoading(false); // Set loading to false once the data is fetched
        })
        .catch((error) => {
          console.error("Error fetching wishlist status:", error);
          setLoading(false);
        });
    }
  }, [id, token, product]);

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
          console.log("Product added to cart:", response.data);
        })
        .catch((error) => console.error("Error adding to cart:", error));
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
              <button className="cart-button" onClick={handleAddToCart}>Add to Cart</button>
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
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
