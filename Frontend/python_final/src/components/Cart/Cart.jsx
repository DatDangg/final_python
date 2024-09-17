import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./style.css";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

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
    const item = cartItems.find((item) => item.id === itemId);
    console.log(item)
    console.log("Stock:", item.variant.quantity);
    console.log("Current Quantity:", quantity);

    if (quantity > 0 && quantity <= item.variant.quantity) {

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
    } else if (quantity > item.variant.quantity) {
      alert("You cannot add more than the available stock.");
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (cartItems.length === 0) {

    return <div className="text-center">
      <img
          src="/photos/cart_empty.png"
          alt="cart_empty"
          className="cart_image align-item-center"
      />
      <h3>Giỏ hàng của bạn trống</h3>
    </div>;
  }

  const totalAmount = cartItems.reduce(
      (acc, item) => acc + Number(item.variant?.listed_price) * item.quantity,
      0
  );

  const handleCheckout = () => {
    navigate("/checkout/address");
  };

  return (
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
          </div>
        </div>

      </div>

    </div>
  );
}

export default Cart;
