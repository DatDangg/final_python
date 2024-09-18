
import React, { useState } from "react";
import ProductList from "../ProductList/ProductList";

function AllProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10; // Số sản phẩm mỗi trang, bạn có thể thay đổi

  return (
    <div className="all-products-page">
      <h1>Tất cả sản phẩm</h1>
      <ProductList
        selectedCategory={null}
        currentPage={currentPage}
        productsPerPage={productsPerPage}
        setTotalProducts={(total) => console.log(total)}
        searchQuery=""
      />
    </div>
  );
}

export default AllProductsPage;
