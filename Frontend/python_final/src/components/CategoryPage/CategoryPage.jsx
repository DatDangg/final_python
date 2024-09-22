import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import ProductList from "../ProductList/ProductList";
import Pagination from "../Pagination/Pagination"; 
import "./catepage.css";

function CategoryPage() {
  const { id } = useParams();
  const location = useLocation();
  const [categoryName, setCategoryName] = useState(location.state?.categoryName || "Category");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(6); 
  const [totalProducts, setTotalProducts] = useState(0);
  const apiurl = import.meta.env.VITE_REACT_APP_API_URL;
  
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      if (!location.state?.categoryName) {
        fetch(`${apiurl}/api/categories/${id}/`)
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
    setCurrentPage(1);
  }, [id]);

  const totalPages = Math.ceil(totalProducts / productsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="category-page">
      <nav className="breadcrumb">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>{categoryName}</li>
        </ul>
      </nav>
      <div className="content-container flex">
        <div className="main-content">
          <ProductList
            selectedCategory={{ id: parseInt(id) }} 
            currentPage={currentPage}
            productsPerPage={productsPerPage}
            setTotalProducts={setTotalProducts} 
            isFromCategoryPage={true}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}

export default CategoryPage;
