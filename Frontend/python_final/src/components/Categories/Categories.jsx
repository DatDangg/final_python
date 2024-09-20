import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";

function Categories() {
  const [categories, setCategories] = useState([]);
  const categoriesRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
    fetch("http://localhost:8000/api/categories/")
      .then((response) => response.json())
      .then((data) => setCategories(data))
      .catch((error) => console.error("Error fetching categories:", error));
    } else {
      setError('No token found');
    }
  }, []);

  const handleCategoryClick = (category) => {
    navigate(`/category/${category.id}`, {
      state: { categoryName: category.name },
    });
  };
  
  return (
    <div className="categories-container">
      <div className="header-container">
        <h2 className="browse-title">Danh mục sản phẩm </h2>
      </div>

      <div className="categories" ref={categoriesRef}>
        {categories.map((category) => (
          <div
            key={category.id}
            className="category-card"
            onClick={() => handleCategoryClick(category)}
          >
            <img
              src={category.image}
              alt={category.name}
              className="category-icon"
            />
            <div className="text-wrapper-15">{category.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Categories;
