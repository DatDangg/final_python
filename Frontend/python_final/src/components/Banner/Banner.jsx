import "./style.css";

function Banner() {
  return (
    <div className="banner-container">
      <div className="banner-content">
        <div className="text-column">
          <h2 className="headline">
            <span className="type">IPhone 14</span>
            <span className="subtype">Pro</span>
          </h2>
          <p className="description">
            Luôn luôn lắng nghe, luôn luôn thấu hiểu
          </p>
          <a href="/product" className="shop-button">
            Mua ngay
          </a>
        </div>
        <div className="image-column">
          <img
            src="../../../banner.png"
            alt="IPhone 14 Pro"
            className="product-image"
          />
        </div>
      </div>
    </div>
  );
}

export default Banner;
