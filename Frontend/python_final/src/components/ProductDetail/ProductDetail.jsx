import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './style.css';

function ProductDetail() {
  const { id } = useParams();  // Lấy id từ URL
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // Fetch product details from the Django API using the id from URL
    fetch(`http://127.0.0.1:8000/api/products/${id}/`)
      .then(response => response.json())
      .then(data => {
        setProduct(data);
        setSelectedImage(data.images);  // Set the single image directly
      })
      .catch(error => console.error('Error fetching product:', error));
  }, [id]);

  const handleIncrease = () => setQuantity(prev => prev + 1);
  const handleDecrease = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="product-detail">
      <div className="container">
        <div className="product-detail__top">
          <div className="product-detail__left">
            <div className="product-main-image">
              <img src={selectedImage} alt={product.title} className="product-image" />
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
            <li><strong>Screen diagonal:</strong> 6.7"</li>
            <li><strong>Resolution:</strong> 2796x1290</li>
            <li><strong>Refresh rate:</strong> 120Hz</li>
            <li><strong>Pixel density:</strong> 460ppi</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
