import './style.css';
import ProductItem from '../ProductItem/ProductItem';
import { useState, useEffect } from 'react';

function ProductList({ selectedCategory }) {
    const [productList, setProductList] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8000/api/products/')
            .then(response => response.json())
            .then(data => {
                if (selectedCategory) {
                    // Filter products based on the selected category
                    const filteredProducts = data.filter(product => product.category.id === selectedCategory.id);
                    setProductList(filteredProducts);
                } else {
                    setProductList(data);
                }
            })
            .catch(error => console.error('Error fetching products:', error));
    }, [selectedCategory]);

    return (
        <div className="product-container">
            <div className="product-list">
                {productList.map((product, index) => (
                    <ProductItem key={index} product={product} />
                ))}
            </div>
        </div>
    );
}

export default ProductList;
