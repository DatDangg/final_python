import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";

function Categories() {
  const [categories, setCategories] = useState([]);
  const categoriesRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/api/categories/")
      .then((response) => response.json())
      .then((data) => setCategories(data))
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  const scrollLeft = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      categoriesRef.current.style.transform = `translateX(-${
        (currentIndex - 1) * 190
      }px)`;
    }
  };

  const scrollRight = () => {
    const totalItems = categories.length;
    if (currentIndex < totalItems - itemsPerPage) {
      setCurrentIndex(currentIndex + 1);
      categoriesRef.current.style.transform = `translateX(-${
        (currentIndex + 1) * 190
      }px)`;
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/category/${category.id}`, {
      state: { categoryName: category.name },
    });
  };
  

  return (
    <div className="categories-container">
      <div className="header-container">
        <h2 className="browse-title">Browse By Category</h2>
        <div className="scroll-buttons-container">
          <button className="scroll-button" onClick={scrollLeft}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="24"
              viewBox="0 0 14 24"
              fill="none"
            >
              <path
                d="M12.3333 23.6667C12.0679 23.6679 11.8132 23.5622 11.6267 23.3733L0.959995 12.7067C0.570057 12.3162 0.570057 11.6838 0.959995 11.2933L11.6267 0.626666C12.0207 0.259521 12.6347 0.270354 13.0155 0.65117C13.3963 1.03199 13.4071 1.64599 13.04 2.04L3.07999 12L13.04 21.96C13.4299 22.3504 13.4299 22.9829 13.04 23.3733C12.8535 23.5622 12.5987 23.6679 12.3333 23.6667Z"
                fill="#2E2E2E"
              />
            </svg>
          </button>
          <button className="scroll-button" onClick={scrollRight}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="24"
              viewBox="0 0 14 24"
              fill="none"
              transform="scale(-1, 1)"
            >
              <path
                d="M12.3333 23.6667C12.0679 23.6679 11.8132 23.5622 11.6267 23.3733L0.959995 12.7067C0.570057 12.3162 0.570057 11.6838 0.959995 11.2933L11.6267 0.626666C12.0207 0.259521 12.6347 0.270354 13.0155 0.65117C13.3963 1.03199 13.4071 1.64599 13.04 2.04L3.07999 12L13.04 21.96C13.4299 22.3504 13.4299 22.9829 13.04 23.3733C12.8535 23.5622 12.5987 23.6679 12.3333 23.6667Z"
                fill="#2E2E2E"
              />
            </svg>
          </button>
        </div>
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
