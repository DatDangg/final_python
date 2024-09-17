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
    <div className="f-inter wishlist-container">
            <h2 className="text-center mb-4 fw-bold">Your Wishlist</h2>
                <div className="product-list d-flex flex-row flex-wrap mb-4 gap-2">
                    {wishListProducts.length > 0 ? (
                        wishListProducts.map((product) => (
                            <ProductItem key={product.id} product={product} token={token}/>
                        ))
                    ) : (
                        <h5 className="text pt-5 text-danger fw-bold">Your wishlist is empty!</h5>
                    )}
                </div>
    </div>
  );
}

export default WishList;
