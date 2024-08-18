import { Link } from 'react-router-dom';
import './style.css';

function ProductItem({ product }) {
    const { title, images, listed_price, id } = product;

    return (
        <div className="item-product">
            <div className="wishlist-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="#000000"/>
                </svg>
            </div>
            <br />
            <div className='item-product-link'>
                <div className="item-product-img" style={{ backgroundImage: `url(${images})` }}></div>
                <h3 className="item-product-name">{title}</h3>
                <div className="item-product-price">
                    <span>{`$${listed_price}`}</span>
                </div>
                <Link to={`/product/${id}`} className="buy-now-link">
                    <button className="buy-now-button">Buy Now</button>
                </Link>
            </div>
        </div>
    );
}

export default ProductItem;
