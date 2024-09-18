
import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import ProductList from "../ProductList/ProductList";
import "./AllProductsPage.css"

function AllProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8; // Số sản phẩm mỗi trang, bạn có thể thay đổi
    const [totalProducts, setTotalProducts] = useState(0);

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
      <div className="all-products-page">
          <h1>Tất cả sản phẩm</h1>
          <ProductList
              selectedCategory={null}
              currentPage={currentPage}
              productsPerPage={productsPerPage}
              setTotalProducts={(total) => console.log(total)}
              searchQuery=""
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
  );
}

export default AllProductsPage;
