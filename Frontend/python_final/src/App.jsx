import React, { useContext } from 'react';
import "./index.css";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Header from "./components/Header/Header";
import Banner from "./components/Banner/Banner";
import Categories from "./components/Categories/Categories";
import CategoryPage from "./components/CategoryPage/CategoryPage";
import ProductDetail from "./components/ProductDetail/ProductDetail";
import SearchPage from "./components/SearchPage/SearchPage";
import AuthPage from './components/Auth/AuthPage'; 
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import UserProfile from './components/UserProfile/UserProfile';
import WishList from './components/WishList/WishList';
import Cart from './components/Cart/Cart';
import Step1 from './components/Cart/Step/Step1';
import Step2 from './components/Cart/Step/Step2';
import Step3 from './components/Cart/Step/Step3';
import Order from './components/Order/Order';
import Footer from "./components/Footer/Footer.jsx";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/auth" />;
}


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
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
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/wishlist" element={<WishList />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout/address" element={<Step1 />} />
                    <Route path="/checkout/shipping" element={<Step2 />} />
                    <Route path="/checkout/payment" element={<Step3 />} />
                    <Route path="/order/:orderId" element={<Order />} />
                  </Routes>
                  <Footer/>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
