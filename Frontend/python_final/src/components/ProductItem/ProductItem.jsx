import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./style.css";
import axios from "axios";

function ProductItem({ product, token }) {
  const { title, images, variants, id } = product;
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [primaryImage, setPrimaryImage] = useState(null);
  const [averageRating, setAverageRating] = useState(null);

  const listedPrice = variants.length > 0 ? parseFloat(variants[0].listed_price) : "N/A";
  const discount = variants.length > 0 ? parseFloat(variants[0].discount) : 0; 
  const discountedPrice = discount > 0 ? listedPrice * (1 - discount / 100) : listedPrice;
  const apiurl = import.meta.env.VITE_REACT_APP_API_URL;

  const primary = images.find((image) => image.is_primary);
  let imageUrl = primary ? primary.image : (images.length > 0 ? images[0].image : null);

  const formatPrice = (number) => {
    const integerPart = Math.floor(number);
    return integerPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const calculateAverageRating = (reviews) => {
    const filteredReviews = reviews.filter((review) => review.product === id);
    if (filteredReviews.length === 0) return "Chưa có đánh giá";
    const totalRating = filteredReviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / filteredReviews.length).toFixed(1);
  };

  useEffect(() => {
    axios
      .get(`${apiurl}/wishlist/${id}/`, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        setIsInWishlist(response.data.is_in_wishlist);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching wishlist status:", error);
        setLoading(false);
      });

    if (imageUrl && !imageUrl.startsWith("http")) {
      imageUrl = `${apiurl}${imageUrl}`;
    }

    setPrimaryImage(imageUrl || "/placeholder.jpg");

    axios
      .get(`${apiurl}/api/reviews/`, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        const reviews = response.data;
        const avgRating = calculateAverageRating(reviews);
        setAverageRating(avgRating);
      })
      .catch((error) => {
        console.error("Error fetching reviews:", error);
      });

  }, [id, token, images]);

  const handleWishlistClick = () => {
    axios
      .post(
        `${apiurl}/wishlist/${id}/toggle/`,
        {},
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        setIsInWishlist(response.data.is_in_wishlist);
      })
      .catch((error) => console.error(error));
  };

  return (
    <div className="product-item">
      {!loading && (
        <div className="wishlist-icon" onClick={handleWishlistClick}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className={isInWishlist ? "filled" : ""}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              stroke="#000000"
            />
          </svg>
        </div>
      )}
      {/*stem discount*/}
      <div className="discount">
        {discount > 0 && (
            <a className="discount-percent text-white fw-bold bg-primary">
              {" "}
              -{discount}%
            </a>
        )}
      </div>
      <br/>
      <div className="item-product-link mb-2">
        <div
            className="item-product-img"
          style={{
            backgroundImage: `url(${primaryImage})`,
          }}
        ></div>
        <div className="name">
          <h3 className="item-product-name text-center text-wrap m-0">{title}</h3>
        </div>
        <div className="">
          {/* Hiển thị giá gốc và giá giảm */}
          {discount > 0 ? (
  <>
    <p className="item-product-price-discount pt-2">
      <span className="text-danger" style={{ fontSize: "12px", verticalAlign: "super" }}>đ</span>
      <span className="fs-4 p-0 m-0 text-danger fw-bold">{formatPrice(Number(discountedPrice))}</span>
      <span style={{ fontSize: "10px", verticalAlign: "super", marginLeft: "8px" }}>đ</span>
      <span style={{ textDecoration: "line-through", fontSize: "15px" }}>
        {formatPrice(Number(listedPrice))}
      </span>
    </p>
  </>
) : (
  <p className="item-product-price text-danger fw-bold" style={{ fontSize: "25px", paddingTop: ".5rem" }}>
    <span style={{ fontSize: "12px", verticalAlign: "super" }}>đ</span>
    {formatPrice(Number(listedPrice))}
  </p>
)}

        </div>
        {/* Hiển thị đánh giá trung bình */}
        <div className="rating m-0 p-0">
          <p>Đánh giá: {averageRating} / 5</p>
        </div>
        <div className="mb-3">
          <Link to={`/product/${id}`} className="buy-now-link">
            <button className="buy-now-button">Mua</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProductItem;
