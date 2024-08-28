import React, { useState, useEffect } from "react";
import ProductItem from "../ProductItem/ProductItem";
import axios from "axios";
import "./style.css";

function WishList() {
  const [wishListProducts, setWishListProducts] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      axios
        .get("http://localhost:8000/wishlist/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        })
        .then((response) => {
          setWishListProducts(response.data);
        })
        .catch((error) => console.error("Error fetching wishlist:", error));
    } else {
      console.error("No token found");
    }
  }, [token]);

  return (
    <div className="wishlist-container">
      <h2>Your Wishlist</h2>
      <div className="product-list">
        {wishListProducts.length > 0 ? (
          wishListProducts.map((product) => (
            <ProductItem key={product.id} product={product} token={token} />
          ))
        ) : (
          <p>Your wishlist is empty.</p>
        )}
      </div>
    </div>
  );
}

export default WishList;
