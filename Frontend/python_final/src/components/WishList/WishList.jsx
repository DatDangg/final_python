import React, { useState, useEffect } from "react";
import ProductItem from "../ProductItem/ProductItem";
import Pagination from "../Pagination/Pagination";
import axios from "axios";
import "./style.css";

function WishList() {
  const [wishListProducts, setWishListProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(8); 
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

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = wishListProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const totalPages = Math.ceil(wishListProducts.length / productsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="f-inter wishlist-container">
      <h2 className="text-center mb-4 fw-bold">Yêu thích</h2>
      <div className="product-list d-flex flex-row flex-wrap mb-4 gap-2">
        {currentProducts.length > 0 ? (
          currentProducts.map((product) => (
            <ProductItem key={product.id} product={product} token={token} />
          ))
        ) : (
          <h5 className="text pt-5 text-danger fw-bold">Your wishlist is empty!</h5>
        )}
      </div>
      {wishListProducts.length > productsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default WishList;
