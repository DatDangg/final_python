import React, { useState } from "react";
import ProductList from "../ProductList/ProductList";
import Pagination from "../Pagination/Pagination"; 
import './AllProductsPage.css'

function AllProductsPage() {
  const [totalProducts, setTotalProducts] = useState(0); 
  const [currentPage, setCurrentPage] = useState(1); 
  const [productsPerPage] = useState(6); 
  const totalPages = Math.ceil(totalProducts / productsPerPage); 

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber); 
  };

  return (
    <div>
      <ProductList
        searchQuery={null}
        selectedCategory={null}
        currentPage={currentPage}
        productsPerPage={productsPerPage}
        setTotalProducts={setTotalProducts}
      />
      
      {totalProducts > productsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default AllProductsPage;
