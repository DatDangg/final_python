import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './discount.css';
import ProductItem from '../ProductItem/ProductItem'; 

const DiscountedProducts = () => {
    const [products, setProducts] = useState([]);
    const token = localStorage.getItem("token");
    const containerRef = useRef(null); 
    const [scrollPosition, setScrollPosition] = useState(0);
    const itemWidth = 360; 

    // Fetch dữ liệu từ API sản phẩm có giảm giá > 50%
    useEffect(() => {
        axios.get('http://localhost:8000/discounted-products/', {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        })
        .then(response => {
            setProducts(response.data);
        })
        .catch(error => {
            console.error('Error fetching discounted products:', error);
        });
    }, [token]);

    const scrollLeft = () => {
        if (containerRef.current) {
            const maxScrollLeft = 0;
            const newPosition = Math.max(scrollPosition - itemWidth * 1, maxScrollLeft);
            setScrollPosition(newPosition);
            containerRef.current.style.transform = `translateX(-${newPosition}px)`;
            console.log(newPosition)
        }
    };

    const scrollRight = () => {
        if (containerRef.current) {
            const maxScrollRight = (products.length * itemWidth) - itemWidth * 1;
            const newPosition = Math.min(scrollPosition + itemWidth * 1, maxScrollRight);
            setScrollPosition(newPosition);
            containerRef.current.style.transform = `translateX(-${newPosition}px)`;
            console.log(newPosition)
        }
    };

    return (
        <div>
            <div className="header-container container">
                <div className="item row d-flex justify-content-center align-items-center">
                    <div className="col">
                        <h4 className="fw-bold">Sản phẩm giảm giá trên 20%</h4>
                    </div>
                    <div className="col">
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
                </div>
            </div>

            <div className="best-selling-products-container">
                <div className="best-selling-products" ref={containerRef}>
                    {products.length > 0 ? (
                        products.map((product, index) => (
                            <ProductItem key={index} product={product} token={token} />
                        ))
                    ) : (
                        <p>No discounted products found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DiscountedProducts;
