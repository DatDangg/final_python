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
  console.log('Search Query:', searchQuery); // Kiểm tra giá trị của searchQuery
  const [productList, setProductList] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/products/")
      .then((response) => response.json())
      .then((data) => {
        let filteredProducts = data;

        // Kiểm tra nếu data là một mảng
        if (Array.isArray(data)) {
          // Nếu có selectedCategory, lọc theo category
          if (selectedCategory) {
            filteredProducts = data.filter(
              (product) => product.category.id === selectedCategory.id
            );
          }

          // Nếu có searchQuery, lọc theo searchQuery
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
          console.error("Expected data to be an array, but got:", typeof data);
        }
      })
      .catch((error) => console.error("Error fetching products:", error));
  }, [selectedCategory, currentPage, productsPerPage, searchQuery, setTotalProducts]);

  return (
    <div className="product-container">
      <div className="product-list">
        {productList.map((product, index) => (
          <ProductItem key={index} product={product} />
        ))}
      </div>
    </div>
  );
}

export default ProductList;
