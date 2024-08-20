import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import Banner from "./components/Banner/Banner";
import Categories from "./components/Categories/Categories";
import CategoryPage from "./components/CategoryPage/CategoryPage";
import ProductDetail from "./components/ProductDetail/ProductDetail";
import SearchPage from "./components/SearchPage/SearchPage";
import "./index.css";

function App() {
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
                <Categories />
                <Banner />
              </>
            }
          />
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
