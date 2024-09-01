import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./step3.css";

const Step3 = () => {
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("qrCode");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the cart items from the API
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
        console.error("Error fetching cart items:", error);
      });

    // Fetch the selected address and shipping cost from local storage
    const storedAddress = JSON.parse(localStorage.getItem("selectedAddress"));
    const storedShipping = JSON.parse(localStorage.getItem("selectedShipping"));

    if (storedAddress) setSelectedAddress(storedAddress);
    if (storedShipping) setShippingCost(storedShipping);
  }, [token]);

  const calculateTotal = () => {
    const subtotal = cartItems.reduce(
      (total, item) => total + item.product.listed_price * item.quantity,
      0
    );
    const estimatedTax = 50; // Replace with actual tax calculation if needed
    return subtotal + estimatedTax + shippingCost;
  };

  const handleConfirmOrder = () => {
    const orderData = {
      full_name: selectedAddress.full_name,
      phone_number: selectedAddress.phone_number,
      address: selectedAddress.specific_address,
      total_price: calculateTotal(),
      payment_method: paymentMethod,
      order_time: new Date().toISOString(),
      items: cartItems.map((item) => ({
        product: item.product.id,
        quantity: item.quantity,
        price: item.product.listed_price,
      })),
    };

    console.log("Order Data:", orderData); // Debug log

    axios
      .post("http://127.0.0.1:8000/api/orders/", orderData, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        console.log("Order saved successfully:", response.data);

        // Giảm số lượng sản phẩm trong kho
        const updateStockPromises = cartItems.map((item) => {
          const newStock = item.product.quantity - item.quantity;
          return axios.patch(
            `http://127.0.0.1:8000/api/products/${item.product.id}/`,
            { quantity: newStock },
            {
              headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
        });

        return Promise.all(updateStockPromises);
      })
      .then(() => {
        console.log("Stock updated successfully.");

        // Xóa giỏ hàng sau khi đặt hàng
        return axios.delete("http://127.0.0.1:8000/api/cart/clear_cart/", {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });
      })
      .then(() => {
        console.log("Cart cleared successfully.");
        navigate("/order-confirmation");
      })
      .catch((error) => {
        console.error("Error processing order:", error);
        if (error.response) {
          alert(
            `Failed to process order: ${
              error.response.data.detail || "Server error"
            }`
          );
        } else {
          alert("Failed to process order: Unknown error");
        }
      });
  };

  return (
    <div className="step3-container">
      <div className="summary-section">
        <h2>Summary</h2>
        {cartItems.map((item) => (
          <div key={item.id} className="cart-item">
            <img
              src={`http://localhost:8000${item.product.images}`}
              alt={item.product.title}
            />
            <div className="item-details">
              <p>{item.product.title}</p>
              <p>
                {item.quantity} x {item.product.listed_price} VND
              </p>
            </div>
          </div>
        ))}

        <div className="address-section">
          <h3>Address</h3>
          {selectedAddress ? (
            <p>
              {selectedAddress.full_name}, {selectedAddress.specific_address},{" "}
              {selectedAddress.phone_number}
            </p>
          ) : (
            <p>No address selected</p>
          )}
        </div>

        <div className="price-details">
          <p>
            Subtotal:{" "}
            {cartItems.reduce(
              (total, item) =>
                total + item.product.listed_price * item.quantity,
              0
            )}{" "}
            VND
          </p>
          <p>Estimated Tax: 50 VND</p>
          <p>Estimated Shipping & Handling: {shippingCost} VND</p>
          <h3>Total: {calculateTotal()} VND</h3>
        </div>
      </div>

      <div className="payment-section">
        <h2>Payment</h2>
        <div className="payment-methods">
          <button
            className={paymentMethod === "qrCode" ? "active" : ""}
            onClick={() => setPaymentMethod("qrCode")}
          >
            QR Code
          </button>
          <button
            className={paymentMethod === "cashOnDelivery" ? "active" : ""}
            onClick={() => setPaymentMethod("cashOnDelivery")}
          >
            Cash on Delivery
          </button>
        </div>

        {paymentMethod === "qrCode" && (
          <div className="qr-code-details">
            <p>Scan the QR code to complete your payment.</p>
            {/* Replace with actual QR code image */}
            <img src="/path/to/qr-code.png" alt="QR Code" />
          </div>
        )}

        {paymentMethod === "cashOnDelivery" && (
          <div className="cash-on-delivery-details">
            <p>You will pay in cash upon receiving the order.</p>
          </div>
        )}

        <div className="actions">
          <button onClick={() => navigate("/checkout/shipping")}>Back</button>
          <button className="pay-button" onClick={handleConfirmOrder}>
            Confirm Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step3;
