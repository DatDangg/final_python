import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './bestsell.css';
import ProductItem from '../ProductItem/ProductItem'; // Import ProductItem component

const BestSellingProducts = () => {
    const [products, setProducts] = useState([]);
    const token = localStorage.getItem("token");
    const containerRef = useRef(null); // Ref for scrollable container
    const itemWidth = 240; // Chiều rộng của mỗi sản phẩm cộng với margin

    // Fetch dữ liệu từ API
    useEffect(() => {
        axios.get('http://localhost:8000/best-selling-products/', {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          })
          .then(response => {
            console.log(response.data); // Log dữ liệu từ API
            setProducts(response.data);
          })
          .catch(error => {
            console.error('Error fetching best selling products:', error);
          });
      }, [token]);
    
    const scrollLeft = () => {
        // Cuộn danh sách sang trái
        if (containerRef.current) {
            containerRef.current.scrollBy({ left: -itemWidth * 4, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        // Cuộn danh sách sang phải
        if (containerRef.current) {
            containerRef.current.scrollBy({ left: itemWidth * 4, behavior: 'smooth' });
        }
    };

    return (
      <div>
        <div className="header-container container">
            <div className="item row d-flex justify-content-center align-items-center">
                <div className="col">
                    <h4 className="fw-bold">Best Selling Products</h4>
                </div>
                <div className="col">
                    <div className="scroll-buttons-container">
                        <div className="">
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
                        </div>
                        <div className="">
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
                </div>
            </div>

        </div>
          <div className="container">
              <div className="row d-flex">
                  <div className="best-selling-products gap-3">
                      {products.length > 0 ? (
                          products.map((product, index) => (
                              // Sử dụng ProductItem để hiển thị từng sản phẩm
                              <ProductItem key={index} product={product} token={localStorage.getItem('token')}/>
                          ))
                      ) : (
                          <p>No best selling products found</p>
                      )}
                  </div>
              </div>
          </div>
      </div>
    );
};

export default BestSellingProducts;
