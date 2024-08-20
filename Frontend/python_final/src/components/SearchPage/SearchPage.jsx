import React, { useState, useEffect } from "react";
import ProductList from "../ProductList/ProductList";
import { useLocation } from "react-router-dom";

function SearchPage() {
  const [searchResults, setSearchResults] = useState([]);
  const location = useLocation();

  const searchQuery = new URLSearchParams(location.search).get("q");
  
  useEffect(() => {
    if (searchQuery) {
      fetch(`http://localhost:8000/api/products/?search=${searchQuery}`)
        .then((response) => response.json())
        .then((data) => setSearchResults(data))
        .catch((error) => console.error("Error fetching search results:", error));
    }
  }, [searchQuery]);

  return (
    <div>
      <ProductList
        searchQuery={searchQuery} 
        selectedCategory={null} 
        currentPage={1}
        productsPerPage={10}
        setTotalProducts={() => {}}
        
      />
    </div>
  );
}

export default SearchPage;
