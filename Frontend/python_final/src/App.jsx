import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import ProductDetail from "./components/ProductDetail/ProductDetail";
import Categories from "./components/Categories/Categories";
import Banner from "./components/Banner/Banner";
import CategoryPage from "./components/CategoryPage/CategoryPage";
import "./index.css";

function App() {


  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={
              <>
                <Banner />
                <Categories/>
                <Banner />
              </>
            }/>
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
