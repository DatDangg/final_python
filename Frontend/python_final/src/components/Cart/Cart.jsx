import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./style.css";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
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
        .catch((error) => {
          setError("Error fetching cart items");
        });
    }
  }, [token]);

  const handleRemoveFromCart = (itemId) => {
    axios
      .delete(`http://127.0.0.1:8000/api/cart/${itemId}/`, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(() => {
        setCartItems(cartItems.filter((item) => item.id !== itemId));
      })
      .catch((error) => console.error("Error removing item from cart:", error));
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    const quantity = parseInt(newQuantity, 10);
    if (quantity > 0) {
      axios
        .patch(
          `http://127.0.0.1:8000/api/cart/${itemId}/`,
          { quantity: quantity },
          {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          }
        )
        .then(() => {
          setCartItems(
            cartItems.map((item) =>
              item.id === itemId ? { ...item, quantity: quantity } : item
            )
          );
        })
        .catch((error) => console.error("Error updating quantity:", error));
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (cartItems.length === 0) {
    return <div>Your cart is empty.</div>;
  }

  const totalAmount = cartItems.reduce(
    (acc, item) => acc + Number(item.product?.listed_price) * item.quantity,
    0
  );

  return (
    <div className="cart-container">
      <div className="cart-items">
        <h2>Shopping Cart</h2>
        <ul>
      {cartItems.map((item) => (
        <li key={item.id} className="cart-item">
          <div className="cart-item-image">
              <img src={`http://localhost:8000${item.product.images}`} alt={item.product.title} />
          </div>
          <div className="cart-item-details">
            <Link to={`/product/${item.product.id}`}>
              <h3>{item.product.title}</h3>
              <p>#{item.product.SKU}</p>
            </Link>
          </div>
          <div className="cart-item-quantity">
            <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>-</button>
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
            />
            <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>+</button>
          </div>
          <div className="cart-item-price">
            <span>{item.product.listed_price} VND</span>
          </div>
          <div className="cart-item-remove">
            <button onClick={() => handleRemoveFromCart(item.id)}>X</button>
          </div>
        </li>
      ))}
    </ul>
      </div>
      <div className="order-summary">
        <h3>Order Summary</h3>
        <input type="text" placeholder="Discount code / Promo code" />
        <input type="text" placeholder="Your bonus card number" />
        <button className="apply-button">Apply</button>
        <div className="summary-totals">
          <div className="summary-item">
            <span>Subtotal</span>
            <span>{totalAmount.toFixed(2)} VND</span>
          </div>
          <div className="summary-item">
            <span>Estimated Tax</span>
            <span>50 VND</span>
          </div>
          <div className="summary-item">
            <span>Estimated Shipping & Handling</span>
            <span>29 VND</span>
          </div>
          <div className="summary-item total">
            <span>Total</span>
            <span>{(totalAmount + 50 + 29).toFixed(2)} VND</span>
          </div>
        </div>
        <button className="checkout-button">Checkout</button>
      </div>
    </div>
  );
}

export default Cart;
