import React, { useState, useEffect } from "react";
import ProductItem from "../ProductItem/ProductItem";
import "./style.css";

function ProductList({
  selectedCategory,
  currentPage,
  productsPerPage,
  setTotalProducts,
}) {
  const [productList, setProductList] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/products/")
      .then((response) => response.json())
      .then((data) => {
        let filteredProducts = data;

        if (selectedCategory) {
          filteredProducts = data.filter(
            (product) => product.category.id === selectedCategory.id
          );
        }

        setTotalProducts(filteredProducts.length);

        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        setProductList(filteredProducts.slice(startIndex, endIndex));
      })
      .catch((error) => console.error("Error fetching products:", error));
  }, [selectedCategory, currentPage, productsPerPage]);

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
