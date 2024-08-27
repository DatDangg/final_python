import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import BreadCrumb from "../BreadCrumb/BreadCrumb";
import ProductList from "../ProductList/ProductList";
import "./style.css";

function CategoryPage() {
  const { id } = useParams();
  const location = useLocation();
  const [categoryName, setCategoryName] = useState(location.state?.categoryName || "Category");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(5); // chỉnh sửa số lượng sản phẩm trên 1 trang
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
    if (!location.state?.categoryName) {
      fetch(`http://127.0.0.1:8000/api/categories/${id}/`)
        .then((response) => response.json())
        .then((data) => {
          setCategoryName(data.name);
        })
        .catch((error) => console.error('Error fetching category name:', error));
    }
  } else {
    setError('No token found');
  }
  }, [id, location.state]);

  useEffect(() => {
    // Reset về trang 1 khi thay đổi danh mục
    setCurrentPage(1);
  }, [id]);

  const totalPages = Math.ceil(totalProducts / productsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
          <button
            key={i}
            className={`pagination-button ${currentPage === i ? "active" : ""}`}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>
        );
      }
    } else {
      // Render số trang với dấu "..."
      pageNumbers.push(
        <button
          key={1}
          className={`pagination-button ${currentPage === 1 ? "active" : ""}`}
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      );

      if (currentPage > 3) {
        pageNumbers.push(
          <span key="start-ellipsis" className="pagination-ellipsis">
            ...
          </span>
        );
      }

      for (let i = Math.max(2, currentPage - 1); i <= Math.min(currentPage + 1, totalPages - 1); i++) {
        pageNumbers.push(
          <button
            key={i}
            className={`pagination-button ${currentPage === i ? "active" : ""}`}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>
        );
      }

      if (currentPage < totalPages - 2) {
        pageNumbers.push(
          <span key="end-ellipsis" className="pagination-ellipsis">
            ...
          </span>
        );
      }

      pageNumbers.push(
        <button
          key={totalPages}
          className={`pagination-button ${
            currentPage === totalPages ? "active" : ""
          }`}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="category-page">
      <BreadCrumb categoryName={categoryName} />
      <div className="content-container flex">
        <div className="main-content">
          <ProductList
            selectedCategory={{ id: parseInt(id) }} // Truyền ID category để lọc sản phẩm
            currentPage={currentPage}
            productsPerPage={productsPerPage}
            setTotalProducts={setTotalProducts} // Đếm tổng số sản phẩm để phân trang
          />
          <div className="pagination">
            <button
              className="pagination-arrow"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            {renderPageNumbers()}
            <button
              className="pagination-arrow"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryPage;
