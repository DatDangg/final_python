import React, { useState } from "react";
import ProductList from "../ProductList/ProductList";
import Pagination from "../Pagination/Pagination"; 
import './AllProductsPage.css'

function AllProductsPage() {
  const [totalProducts, setTotalProducts] = useState(0); 
  const [currentPage, setCurrentPage] = useState(1); 
  const [productsPerPage] = useState(6); 

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber); 
  };

  const totalPages = Math.ceil(totalProducts / productsPerPage); 

  return (
    <div>
      <ProductList
        searchQuery={null}
        selectedCategory={null}
        currentPage={currentPage}
        productsPerPage={productsPerPage}
        setTotalProducts={setTotalProducts}
      />
      
      {totalProducts > 0 && (
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
