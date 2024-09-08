import React, { useState, useEffect } from "react";
import ProductItem from "../ProductItem/ProductItem";
import "./style.css";

function ProductList({
  selectedCategory,
  currentPage,
  productsPerPage,
  setTotalProducts,
  searchQuery,
}) {
  const [productList, setProductList] = useState([]);
  const token = localStorage.getItem("token");
  
  useEffect(() => {
    if (token) {
      fetch("http://localhost:8000/api/products/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          let filteredProducts = data;

          if (Array.isArray(data)) {
            if (selectedCategory) {
              filteredProducts = filteredProducts.filter(
                (product) => product.category === selectedCategory.id
              );
            }

            if (searchQuery) {
              filteredProducts = filteredProducts.filter((product) =>
                product.title.toLowerCase().includes(searchQuery.toLowerCase())
              );
            }

            setTotalProducts(filteredProducts.length);

            const startIndex = (currentPage - 1) * productsPerPage;
            const endIndex = startIndex + productsPerPage;
            setProductList(filteredProducts.slice(startIndex, endIndex));
          } else {
            console.error(
              "Expected data to be an array, but got:",
              typeof data
            );
          }
        })
        .catch((error) => console.error("Error fetching products:", error));
    } else {
      console.error("No token found");
    }
  }, [
    selectedCategory,
    currentPage,
    productsPerPage,
    searchQuery,
    setTotalProducts,
    token,
  ]);

  return (
    <div className="product-container">
      <div className="product-list">
        {productList.map((product, index) => (
          <ProductItem key={index} product={product} token={token} />
        ))}
      </div>
    </div>
  );
}

export default ProductList;
