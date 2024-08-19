import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import ProductList from "./components/ProductList/ProductList";
import Header from "./components/Header/Header";
import ProductDetail from "./components/ProductDetail/ProductDetail";
import Categories from "./components/Categories/Categories";
import Banner from "./components/Banner/Banner";
import { useState } from "react";
import CategoryPage from "./components/CategoryPage/CategoryPage";

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Banner />
                <Categories onCategorySelect={handleCategorySelect} />
                <div className="product_list flex justify-between">
                  <ProductList selectedCategory={selectedCategory} />
                </div>
                <Banner />
              </>
            }
          />
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
