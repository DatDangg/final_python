import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import axios from "axios";
import "./header.css";

function Header() {
  const { cartItems } = useContext(CartContext);
  const location = useLocation();
  const currentPath = location.pathname;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showWishList, setShowWishList] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(cartItems.length); // Lấy số lượng ban đầu từ cartItems
  const BASE_URL = "http://localhost:8000/";

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery) {
      navigate(`/search?q=${searchQuery}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleWishlistClick = () => {
    setShowWishList(!showWishList);
  };

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
          setCartItemCount(response.data.length);
        })
        .catch((error) => console.error("Error fetching cart items:", error));
    }
  }, [token]);

  useEffect(() => {
    setCartItemCount(cartItems.length); // Cập nhật lại số lượng giỏ hàng khi cartItems thay đổi
  }, [cartItems]); // Thêm cartItems vào dependency

  useEffect(() => {
    if (searchQuery) {
      axios
        .get(`http://127.0.0.1:8000/products/suggestions/?q=${searchQuery}`)
        .then((response) => {
          setSuggestions(response.data);
        })
        .catch((error) => console.error("Error fetching suggestions:", error));
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  return (
    <header className="header">
      <img className="logo" alt="Logo" src="../../../logo.jpg" />
      <form className="search-field" onSubmit={handleSearch}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="icon-search"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <input
          className="search-input"
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      {/* Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((product) => (
            <div
              className="suggestion-item"
              key={product.id}
              onClick={() => {
                navigate(`/product/${product.id}`);
                setSearchQuery("");
              }}
            >
              <img
                src={
                  product.images.find((img) => img.is_primary)?.image
                    ? `${BASE_URL}${product.images.find((img) => img.is_primary).image}`
                    : product.images.length > 0
                    ? `${BASE_URL}${product.images[0].image}`
                    : ""
                }
                alt={product.title}
                className="suggestion-image"
              />
              <span>{product.title}</span>
            </div>
          ))}
        </div>
      )}
      <div className="navbar">
        <Link
          to="/"
          className={`nav-item ${currentPath === "/" ? "active" : ""}`}
        >
          Home
        </Link>
        <Link
          to="/product"
          className={`nav-item ${currentPath === "/product" ? "active" : ""}`}
        >
          Product
        </Link>
        <Link
          to="/contact"
          className={`nav-item ${currentPath === "/contact" ? "active" : ""}`}
        >
          Contact Us
        </Link>
      </div>
      <div className="icons">
        <Link to="/wishlist">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            onClick={handleWishlistClick}
          >
            <path
              d="M11 7C8.239 7 6 9.216 6 11.95C6 14.157 6.875 19.395 15.488 24.69C15.6423 24.7839 15.8194 24.8335 16 24.8335C16.1806 24.8335 16.3577 24.7839 16.512 24.69C25.125 19.395 26 14.157 26 11.95C26 9.216 23.761 7 21 7C18.239 7 16 10 16 10C16 10 13.761 7 11 7Z"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <Link to="/cart">
          <div style={{ position: "relative" }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
            >
              <path
                d="M3 5H7L10 22H26M10 16.6667H25.59C25.7056 16.6667 25.8177 16.6267 25.9072 16.5535C25.9966 16.4802 26.0579 16.3782 26.0806 16.2648L27.8806 7.26479C27.8951 7.19222 27.8934 7.11733 27.8755 7.04552C27.8575 6.97372 27.8239 6.90679 27.7769 6.84956C27.73 6.79234 27.6709 6.74625 27.604 6.71462C27.5371 6.68299 27.464 6.66662 27.39 6.66667H8M12 26C12 26.5523 11.5523 27 11 27C10.4477 27 10 26.5523 10 26C10 25.4477 10.4477 25 11 25C11.5523 25 12 25.4477 12 26ZM26 26C26 26.5523 25.5523 27 25 27C24.4477 27 24 26.5523 24 26C24 25.4477 24.4477 25 25 25C25.5523 25 26 25.4477 26 26Z"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {cartItemCount > 0 && (
              <span className="cart-count">{cartItemCount}</span>
            )}
          </div>
        </Link>
        {token ? (
          <div className="dropdown">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="user-icon"
              onClick={toggleDropdown}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM5.25 18.75A6.75 6.75 0 0 1 12 15a6.75 6.75 0 0 1 6.75 3.75"
              />
            </svg>
            {isDropdownOpen && (
              <div className="dropdown-content">
                <Link to="/profile">Profile</Link>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="user-icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25V9m6 4.5V21m0 0 3-3m-3 3-3-3"
              />
            </svg>
          </Link>
        )}
      </div>
    </header>
  );
}

export default Header;
