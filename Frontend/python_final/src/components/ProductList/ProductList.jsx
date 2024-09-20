import React, { useState, useEffect } from "react";
import ProductItem from "../ProductItem/ProductItem";
import Aside from "../Aside/Aside";
import "./style.css";

function ProductList({ selectedCategory, currentPage, productsPerPage, setTotalProducts, searchQuery, isFromCategoryPage }) {
  const [productList, setProductList] = useState([]);
  const [filters, setFilters] = useState({
    brand: '',
    categoryId: '', // Đổi tên thành categoryId
    minPrice: '',
    maxPrice: '',
  });
  const token = localStorage.getItem("token");
  const apiurl = import.meta.env.VITE_REACT_APP_API_URL;

  const handleFilterChange = (newFilters) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters,
    }));
  };

  useEffect(() => {
    const fetchProducts = async () => {
      if (token) {
        let url = `${apiurl}/api/products/?category=${selectedCategory?.id || ''}&search=${searchQuery || ''}`;
        
        if (filters.brand) url += `&brand=${filters.brand}`;
        if (!isFromCategoryPage && filters.categoryId) url += `&category=${filters.categoryId}`; // Sử dụng categoryId trong URL
        if (filters.minPrice) url += `&variants__listed_price__gte=${filters.minPrice}`;
        if (filters.maxPrice) url += `&variants__listed_price__lte=${filters.maxPrice}`;
        
        const response = await fetch(url, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setTotalProducts(data.length);
          const startIndex = (currentPage - 1) * productsPerPage;
          const endIndex = startIndex + productsPerPage;
          setProductList(data.slice(startIndex, endIndex));
        } else {
          console.error("Expected data to be an array, but got:", typeof data);
        }
      } else {
        console.error("No token found");
      }
    };
    
    fetchProducts();
  }, [selectedCategory, currentPage, productsPerPage, searchQuery, setTotalProducts, token, filters]);

  return (
    <div className="product-page container-fluid pt-5 mb-5">
      <div className="row d-flex p-0 m-0">
        <div className="col-md-3 aside justify-content-center align-items-center">
          <Aside onFilterChange={handleFilterChange}
          hideCategoryFilter={isFromCategoryPage} />
        </div>
        <div className="col-md-8">
          <div className="product-container">
            <div className="product-list gap-2">
              {productList.map((product, index) => (
                <ProductItem key={index} product={product} token={token} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductList;
