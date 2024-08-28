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
          console.log("Cart Items:", response.data);
          setCartItems(response.data);
        })
        .catch((error) => {
          console.error("Error fetching cart items:", error);
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
    <div className="cart">
      <h2>Your Cart</h2>
      <ul>
        {cartItems.map((item) => (
          <li key={item.id} className="cart-item">
            <Link to={`/products/${item.product.id}`}>
              <img src={item.product.images} alt={item.product.title} />
              <span>{item.product.title}</span>
            </Link>
            <span>{item.product.listed_price} VND</span>
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
            />
            <button onClick={() => handleRemoveFromCart(item.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <div className="cart-summary">
        <h3>Total: {totalAmount.toFixed(2)} VND</h3>
        <button className="checkout-button">Proceed to Checkout</button>
      </div>
    </div>
  );
}

export default Cart;
