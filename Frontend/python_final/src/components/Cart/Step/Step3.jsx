import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../../context/CartContext";
import axios from "axios";
import "./step3.css";

const Step3 = () => {
  const [cartItems, setCartItems] = useState([]);
  const { clearCart } = useContext(CartContext); 
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
        clearCart(); 
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
      <div className="step3-container container gap-4">
        {/*section-left*/}
        <div className="summary-section col-md-6">
          {/*summary*/}
          <h2 className="fw-bold">Order Details</h2>
          {cartItems.map((item) => {
            const primaryImage =
                item.product.images.find((image) => image.is_primary)?.image ||
                item.product.images[0]?.image;
            return (
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
        </div>

        {/*section-right*/}
        <div className="payment-section col-md-6">
          {/*address*/}
          <div className="right-top">
            <div className="address-section">
              <h3 className="fw-bold">Address</h3>
              <div className="text-address">
                {selectedAddress ? (
                    <p>
                      {selectedAddress.full_name}, {selectedAddress.specific_address},{" "}
                      {selectedAddress.phone_number}
                    </p>
                ) : (
                    <p>No address selected</p>
                )}
              </div>
            </div>
            <div className="price-details">
              <h3 className="fw-bold mb-2">Summary</h3>
              <p>
                Subtotal:{" "}
                {cartItems.reduce(
                    (total, item) =>
                        total + item.variant.listed_price * item.quantity,
                    0
                )}{"đ"}

              </p>
              <p>Estimated Tax: 5000đ </p>
              <p>Estimated Shipping & Handling: {Number(shippingCost).toFixed(0)}đ </p>
              <h3 className="fw-bold pt-3">Total: {Number(calculateTotal())}đ </h3>
            </div>
          </div>

          {/*payment*/}
          <div className="right-bottom mb-4">
            <h2 className="mb-4 fw-bold">Payment</h2>
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
                <div className="qr-code-prompt pt-3">
                  <button onClick={() => setQrCodeVisible(true)}>
                    Confirm and Show QR Code
                  </button>
                </div>
            )}

            {qrCodeVisible && (
                <div className="qr-code-details pt-3">
                  <p>Scan the QR code to complete your payment.</p>
                  <img
                      src={`https://qr.sepay.vn/img?acc=4220112003&bank=MBBANK&amount=${calculateTotal()}`}
                      alt="QR Code"
                  />
                  <button className="btn btn-outline-primary" onClick={handleCheckTransaction}>Check Transaction</button>
                </div>
            )}

            {paymentMethod === "cashOnDelivery" && (
                <div className="cash-on-delivery-details">
                  <p className="pt-4">You will pay in cash upon receiving the order.</p>
                  <button className="pay-button" onClick={handleConfirmOrder}>
                    Confirm Order
                  </button>
                </div>

            )}
            <div className="actions">
              {transactionSuccess ? (
                  <button className="pay-button" onClick={handleConfirmOrder}>
                    Confirm Order
                  </button>
              ) : null}
            </div>


          </div>
          <button className="back btn btn-outline-dark"  onClick={() => navigate("/checkout/shipping")}>Back</button>

        </div>

      </div>
  );
};

export default Step3;
