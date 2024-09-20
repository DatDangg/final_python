import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext"; // Import CartContext
import "./style.css";

function Cart() {
  const { cartItems, removeFromCart, updateQuantity } = useContext(CartContext); // Sử dụng cartItems, removeFromCart và updateQuantity từ context
  const navigate = useNavigate();
  const apiurl = import.meta.env.VITE_REACT_APP_API_URL;

  const handleQuantityChange = (itemId, newQuantity) => {
    const quantity = parseInt(newQuantity, 10);
    const item = cartItems.find((item) => item.id === itemId);

    if (quantity > 0 && quantity <= item.variant.quantity) {
      updateQuantity(itemId, quantity); // Sử dụng hàm updateQuantity từ context để cập nhật số lượng
    } else if (quantity > item.variant.quantity) {
      alert("You cannot add more than the available stock.");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center">
        <img
          src="/photos/cart_empty.png"
          alt="cart_empty"
          className="cart_image align-item-center"
        />
        <h3>Giỏ hàng của bạn trống</h3>
      </div>
    );
  }

  // Hàm định dạng số với dấu phẩy
  const formatPrice = (number) => {
    const integerPart = Math.floor(number);
    return integerPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const totalAmount = cartItems.reduce(
    (acc, item) => acc + Number(item.variant?.listed_price) * item.quantity,
    0
  );

  const handleCheckout = () => {
    navigate("/checkout/address");
  };

  return (
    <div className="cart-container container">
      <div className="cart-items pt-5 row">
        <h2 className="mb-4">Giỏ hàng</h2>
        <div className="items">
          <ul>
            {cartItems.map((item) => {
              const primaryImage =
                item.product.images.find((image) => image.is_primary)?.image ||
                item.product.images[0]?.image;
              return (
                <li key={item.id} className="cart-item">
                  <div className="cart-item-image">
                    <img
                      src={`${apiurl}${primaryImage}`}
                      alt={item.product.title}
                    />
                  </div>
                  <div className="cart-item-details">
                    <Link to={`/product/${item.product.id}`}>
                      <h3>{item.product.title}</h3>
                      <p>#{item.variant.SKU}</p>
                    </Link>
                  </div>
                  <div className="cart-item-quantity">
                    <button
                      className="checkout-button btn btn-outline-dark fw-bold"
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1} // Không giảm quá 1
                    >
                      -
                    </button>
                    <input
                      className="text-button"
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(item.id, e.target.value)
                      }
                    />
                    <button
                      className="checkout-button btn btn-outline-dark fw-bold"
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.variant.quantity} // Không tăng quá tồn kho
                    >
                      +
                    </button>
                  </div>
                  <div className="cart-item-price m-3">
                    <span>
                      <span style={{ fontSize: "12px", verticalAlign: "super" }}>đ</span>
                      {formatPrice(Number(item.variant.listed_price))}
                    </span>
                  </div>
                  <div className="cart-item-remove m-3">
                    <button
                      className="checkout-button"
                      onClick={() => removeFromCart(item.id)} // Sử dụng removeFromCart từ context để xóa sản phẩm
                    >
                      x
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          {/*button*/}
          <div className="order-summary">
            <div className="summary-totals">
              <div className="summary-item total">
                <span>
                  <span style={{ fontSize: "12px", verticalAlign: "super" }}>đ</span>
                  {formatPrice(Number(totalAmount).toFixed(0))}
                </span>
              </div>
            </div>
            <button className="check-button text-white" onClick={handleCheckout}>
              Thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
