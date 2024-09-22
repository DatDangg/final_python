import React, { useState, useEffect } from "react";
import ProductList from "../ProductList/ProductList";
import Pagination from "../Pagination/Pagination"; 
import { useLocation } from "react-router-dom";

function SearchPage() {
  const [searchResults, setSearchResults] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0); 
  const [currentPage, setCurrentPage] = useState(1); 
  const [productsPerPage] = useState(10);

  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get("q");
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  useEffect(() => {
    if (searchQuery) {
      fetch(
        `http://localhost:8000/api/products/?search=${searchQuery}&page=${currentPage}&page_size=${productsPerPage}`
      )
        .then((response) => response.json())
        .then((data) => {
          setSearchResults(data.results); 
          setTotalProducts(data.count); 
        })
        .catch((error) => console.error("Error fetching search results:", error));
    }
  }, [searchQuery, currentPage, productsPerPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber); 
  };

  return (
    <div>
      <ProductList
        searchQuery={searchQuery}
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

export default SearchPage;
