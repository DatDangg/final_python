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
  const apiurl = import.meta.env.VITE_REACT_APP_API_URL;
  
  const [transactionSuccess, setTransactionSuccess] = useState(false);

  // Hàm để định dạng số tiền với dấu phẩy
  const formatPrice = (number) => {
    const integerPart = Math.floor(number);
    return integerPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  useEffect(() => {
    // Fetch the cart items from the API
    axios
      .get(`${apiurl}/api/cart/`, {
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
    return subtotal + shippingCost;
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

    axios
      .post(`${apiurl}/api/orders/`, orderData, {
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
            `${apiurl}/api/products/${item.product.id}/update-variant/`,
            {
              variant_id: item.variant.id,
              quantity: newStock,
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
        return axios.delete(`${apiurl}/api/cart/clear_cart/`, {
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
    const totalAmount = calculateTotal();
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
        <h2 className="fw-bold">
          Chi tiết đặt hàng</h2>
        {cartItems.map((item) => {
          const primaryImage =
            item.product.images.find((image) => image.is_primary)?.image ||
            item.product.images[0]?.image;
          return (
            <div key={item.id} className="cart-item">
              <img
                src={`${apiurl}${primaryImage}`}
                alt={item.product.title}
              />
              <div className="item-details">
                <p>{item.product.title}</p>
                <p>
                  {item.quantity} x{" "}
                  <span style={{ fontSize: "12px", verticalAlign: "super" }}>đ</span>
                  {formatPrice(item.variant.listed_price)}
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
            <h3 className="fw-bold">Địa chỉ</h3>
            <div className="text-address">
              {selectedAddress ? (
                <p>
                  {selectedAddress.full_name}, {selectedAddress.specific_address},{" "}
                  {selectedAddress.phone_number}
                </p>
              ) : (
                <p>Không có địa chỉ nào được chọn</p>
              )}
            </div>
          </div>
          <div className="price-details">
            <h3 className="fw-bold mb-2">Tóm tắt đơn hàng</h3>
            <p>
              Tổng sản phẩm:{" "}
              <span style={{ fontSize: "12px", verticalAlign: "super" }}>đ</span>
              {formatPrice(
                cartItems.reduce(
                  (total, item) =>
                    total + item.variant.listed_price * item.quantity,
                  0
                )
              )}
            </p>
            <p>
              Phí vận chuyển:{" "}
              <span style={{ fontSize: "12px", verticalAlign: "super" }}>đ</span>
              {formatPrice(Number(shippingCost).toFixed(0))}
            </p>
            <h3 className="fw-bold pt-3">
              Tổng tiền:{" "}
              <span style={{ fontSize: "12px", verticalAlign: "super" }}>đ</span>
              {formatPrice(calculateTotal())}
            </h3>
          </div>
        </div>

        {/*payment*/}
        <div className="right-bottom mb-4">
          <h2 className="mb-4 fw-bold">Thanh toán</h2>
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
              Tiền mặt khi giao hàng
            </button>
          </div>

          {paymentMethod === "qrCode" && !qrCodeVisible && (
            <div className="qr-code-prompt pt-3">
              <button onClick={() => setQrCodeVisible(true)}>
                Xác nhận và hiển thị mã QR
              </button>
            </div>
          )}

          {qrCodeVisible && (
            <div className="qr-code-details pt-3">
              <p>
                Quét mã QR để hoàn tất thanh toán của bạn.</p>
              <img
                src={`https://qr.sepay.vn/img?acc=4220112003&bank=MBBANK&amount=${calculateTotal()}`}
                alt="QR Code"
              />
              <button
                className="btn btn-outline-primary"
                onClick={handleCheckTransaction}
              >
                Kiểm tra giao dịch
              </button>
            </div>
          )}

          {paymentMethod === "cashOnDelivery" && (
            <div className="cash-on-delivery-details">
              <p className="pt-4">
                Bạn sẽ thanh toán bằng tiền mặt khi nhận được đơn hàng.
              </p>
              <button className="pay-button" onClick={handleConfirmOrder}>
                Xác nhận đơn hàng
              </button>
            </div>
          )}
          {/*<div className="actions">*/}
          {/*  {transactionSuccess ? (*/}
          {/*    <button className="pay-button" onClick={handleConfirmOrder}>*/}
          {/*      Xác nhận đơn hàng*/}
          {/*    </button>*/}
          {/*  ) : null}*/}
          {/*</div>*/}
        </div>
        <button
          className="back btn btn-outline-dark"
          onClick={() => navigate("/checkout/shipping")}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default Step3;
