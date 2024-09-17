import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext"; // Đường dẫn tới CartContext
import "./style.css";

function Cart() {
  const { cartItems, removeFromCart, updateQuantity } = useContext(CartContext); // Sử dụng removeFromCart và updateQuantity từ CartContext
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleQuantityChange = (itemId, newQuantity) => {
    const quantity = parseInt(newQuantity, 10);
    const item = cartItems.find((item) => item.id === itemId);

    if (quantity > 0 && quantity <= item.variant.quantity) {
      updateQuantity(itemId, quantity); // Cập nhật số lượng thông qua context
    } else if (quantity > item.variant.quantity) {
      alert("You cannot add more than the available stock.");
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

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

  const totalAmount = cartItems.reduce(
    (acc, item) => acc + Number(item.variant?.listed_price) * item.quantity,
    0
  );

  const handleCheckout = () => {
    navigate("/checkout/address");
  };

  return (
<<<<<<< HEAD
    <div className="cart-container">
      <div className="cart-items">
        <h2>Shopping Cart</h2>
        <ul>
          {cartItems.map((item) => {
            const primaryImage =
              item.product.images.find((image) => image.is_primary)?.image ||
              item.product.images[0]?.image;
            return (
              <li key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <img
                    src={`http://localhost:8000${primaryImage}`}
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
                    className="btn btn-outline-dark"
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1} // Không giảm quá 1
                  >
                    <img
                      src="https://frontend.tikicdn.com/_desktop-next/static/img/pdp_revamp_v2/icons-remove.svg"
                      alt=""
                    />
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(item.id, e.target.value)
                    }
                  />
                  <button
                    className="btn btn-outline-dark"
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity + 1)
                    }
                    disabled={item.quantity >= item.variant.quantity} // Không tăng quá tồn kho
                  >
                    <img
                      src="https://frontend.tikicdn.com/_desktop-next/static/img/pdp_revamp_v2/icons-add.svg"
                      alt=""
                    />
                  </button>
                </div>
                <div className="cart-item-price">
                  <span>{item.variant.listed_price} VND</span>
                </div>
                <div className="cart-item-remove">
                  <button onClick={() => removeFromCart(item.id)}> {/* Sử dụng hàm removeFromCart */}
                    X
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="order-summary">
        <div className="summary-totals">
          <div className="summary-item total">
            <span>Total</span>
            <span>{totalAmount.toFixed(2)} VND</span>
=======
    <div className="cart-container container">
      <div className="cart-items pt-5">
        <h2 className="mb-4">Shopping Cart</h2>
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
                          src={`http://localhost:8000${primaryImage}`}
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
                          className="checkout-button btn btn-outline-dark"
                          onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1} // Không giảm quá 1
                      >
                        <img
                            src="https://frontend.tikicdn.com/_desktop-next/static/img/pdp_revamp_v2/icons-remove.svg"
                            alt=""
                        />
                      </button>
                      <input className="text-button"
                             type="number"
                             value={item.quantity}
                             onChange={(e) =>
                                 handleQuantityChange(item.id, e.target.value)
                             }
                      />
                      <button
                          className="checkout-button btn btn-outline-dark"
                          onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.variant.quantity} // Không tăng quá tồn kho
                      >
                        <img
                            src="https://frontend.tikicdn.com/_desktop-next/static/img/pdp_revamp_v2/icons-add.svg"
                            alt=""
                        />
                      </button>
                    </div>
                    <div className="cart-item-price m-3">
                      <span>{item.variant.listed_price}đ</span>
                    </div>
                    <div className="cart-item-remove m-3">
                      <button className="checkout-button" onClick={() => handleRemoveFromCart(item.id)}>
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
                <span>Total: {totalAmount.toFixed(2)} VND</span>
              </div>
            </div>
            <button className="check-button text-white" onClick={handleCheckout}>
              Checkout
            </button>
>>>>>>> 4a33b21b3b35d7039543b898042335acedb9f9aa
          </div>
        </div>

      </div>

    </div>
  );
}

export default Cart;
