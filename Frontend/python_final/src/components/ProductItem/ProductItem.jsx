import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./style.css";
import axios from "axios";

function ProductItem({ product, token }) {
  const { title, images, variants, id } = product;
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [primaryImage, setPrimaryImage] = useState(null);

  // Lấy giá từ variant đầu tiên
  const listedPrice = variants.length > 0 ? variants[0].cost_price : "N/A";

  // Hàm định dạng số với dấu phẩy
  const formatPrice = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  useEffect(() => {
    // Fetch wishlist status
    axios
      .get(`http://127.0.0.1:8000/wishlist/${id}/`, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        setIsInWishlist(response.data.is_in_wishlist);
        setLoading(false); // Set loading to false once the data is fetched
      })
      .catch((error) => {
        console.error("Error fetching wishlist status:", error);
        setLoading(false);
      });

    // Xử lý URL hình ảnh
    const primary = images.find((image) => image.is_primary);
    let imageUrl = primary ? primary.image : (images.length > 0 ? images[0].image : null);

    // Nếu imageUrl không bắt đầu bằng "http", ta ghép với URL đầy đủ
    if (imageUrl && !imageUrl.startsWith("http")) {
      imageUrl = `http://localhost:8000${imageUrl}`;
    }

    setPrimaryImage(imageUrl || "/placeholder.jpg"); // Fallback nếu không có ảnh
  }, [id, token, images]);

  const handleWishlistClick = () => {
    axios
      .post(
        `http://127.0.0.1:8000/wishlist/${id}/toggle/`,
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
        if (response.data.is_in_wishlist) {
          console.log("Sản phẩm đã được thêm vào wishlist.");
        } else {
          console.log("Sản phẩm đã được xóa khỏi wishlist.");
        }
      })
      .catch((error) => console.error(error));
  };

  return (
    <div className="">
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
        <br />
        <div className="item-product-link">
          <div
            className="item-product-img"
            style={{
              backgroundImage: `url(${primaryImage})`,
            }} // Sử dụng primary image hoặc một ảnh placeholder
          ></div>
          <div className="name">
            <h3 className="item-product-name text-center text-wrap">{title}</h3>
          </div>
          <div className="">
            {/* Hiển thị giá dưới tên sản phẩm */}
            <p className="item-product-price text-danger">
              <span style={{ fontSize: "12px", verticalAlign: "super" }}>đ</span>
              {formatPrice(Number(listedPrice))}
            </p>
          </div>
          <div className="mb-3">
            <Link to={`/product/${id}`} className="buy-now-link">
              <button className="buy-now-button">Mua</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductItem;
