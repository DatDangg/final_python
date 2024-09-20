import React, { useState, useEffect } from "react";
import ProductList from "../ProductList/ProductList";
import Pagination from "../Pagination/Pagination"; // Import Pagination component
import { useLocation } from "react-router-dom";

function SearchPage() {
  const [searchResults, setSearchResults] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0); // Tổng số sản phẩm
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [productsPerPage] = useState(2); // Số sản phẩm trên mỗi trang
  const apiurl = import.meta.env.VITE_REACT_APP_API_URL;

  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get("q");

  useEffect(() => {
    if (searchQuery) {
      fetch(
        `${apiurl}/api/products/?search=${searchQuery}&page=${currentPage}&page_size=${productsPerPage}`
      )
        .then((response) => response.json())
        .then((data) => {
          setSearchResults(data.results); // Giả sử API trả về 'results' chứa danh sách sản phẩm
          setTotalProducts(data.count); // Giả sử API trả về 'count' là tổng số sản phẩm
        })
        .catch((error) => console.error("Error fetching search results:", error));
    }
  }, [searchQuery, currentPage, productsPerPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber); // Cập nhật trang khi chuyển trang
  };

  const totalPages = Math.ceil(totalProducts / productsPerPage); // Tính tổng số trang

  return (
    <div>
      <ProductList
        searchQuery={searchQuery}
        selectedCategory={null}
        currentPage={currentPage}
        productsPerPage={productsPerPage}
        setTotalProducts={setTotalProducts}
      />
      
      {/* Hiển thị phân trang nếu có kết quả tìm kiếm */}
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
