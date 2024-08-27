import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "./style.css";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  // console.log(product.category.name)

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
    fetch(`http://127.0.0.1:8000/api/products/${id}/`)
      .then((response) => response.json())
      .then((data) => {
        setProduct(data);
        setSelectedImage(data.images);
      })
      .catch((error) => console.error("Error fetching product:", error));
    } else {
      setError('No token found');
    }
  }, [id]);

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
              <button className="wishlist-button">Add to Wishlist</button>
              <button className="cart-button">Add to Cart</button>
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
