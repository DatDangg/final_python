import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./step3.css";

const Step3 = () => {
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("qrCode");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [qrCodeVisible, setQrCodeVisible] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  
  const [transactionSuccess, setTransactionSuccess] = useState(false); // for payment verification

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
      (total, item) => total + item.variant.listed_price * item.quantity,
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
        price: item.variant.listed_price,
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
          const newStock = item.variant.quantity - item.quantity;
          return axios.patch(
            `http://127.0.0.1:8000/api/products/${item.product.id}/update-variant/`,
            {
              variant_id: item.variant.id,
              quantity: newStock
            },
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

  const handleCheckTransaction = () => {
    const totalAmount = calculateTotal(); // Tính tổng tiền
    axios
      .get(`/check-transaction?total_amount=${totalAmount}`)
      .then((response) => {
        if (response.status === 200) {
          alert("Transaction successful!");
          setTransactionSuccess(true);
          handleConfirmOrder(); // Gọi hàm để hoàn tất đặt hàng
        }
      })
      .catch((error) => {
        alert("Transaction not found or error occurred.");
      });
  };
  

  return (
    <div className="step3-container container">
      <div className="summary-section">
        <h2>Summary</h2>
        {cartItems.map((item) => {
          const primaryImage =
            item.product.images.find((image) => image.is_primary)?.image ||
            item.product.images[0]?.image;
          return(
          <div key={item.id} className="cart-item">
            <img
              src={`http://localhost:8000${primaryImage}`}
              alt={item.product.title}
            />
            <div className="item-details">
              <p>{item.product.title}</p>
              <p>
                {item.quantity} x {item.variant.listed_price} VND
              </p>
            </div>
          </div>
          );
        })}
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
                total + item.variant.listed_price * item.quantity,
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

        {paymentMethod === "qrCode" && !qrCodeVisible && (
          <div className="qr-code-prompt">
            <button onClick={() => setQrCodeVisible(true)}>
              Confirm and Show QR Code
            </button>
          </div>
        )}

        {qrCodeVisible && (
          <div className="qr-code-details">
            <p>Scan the QR code to complete your payment.</p>
            <img
              src={`https://qr.sepay.vn/img?acc=4220112003&bank=MBBANK&amount=${calculateTotal()}`}
              alt="QR Code"
            />
            <button onClick={handleCheckTransaction}>Check Transaction</button>
          </div>
        )}

        {paymentMethod === "cashOnDelivery" && (
          <div className="cash-on-delivery-details">
            <p>You will pay in cash upon receiving the order.</p>
            <button className="pay-button" onClick={handleConfirmOrder}>
              Confirm Order
            </button>
          </div>
        )}

        <div className="actions">
          <button onClick={() => navigate("/checkout/shipping")}>Back</button>
          {transactionSuccess ? (
            <button className="pay-button" onClick={handleConfirmOrder}>
              Confirm Order
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Step3;
