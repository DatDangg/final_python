import "./banner.css";

function Banner() {
  return (
    <div className="banner-container">
      <div className="banner-content">
        <div className="text-column">
          <h2 className="headline">
            <span className="type">IPhone 16</span>
            <span className="subtype">Plus</span>
          </h2>
          <p className="description">
            Luôn luôn lắng nghe, luôn luôn thấu hiểu
          </p>
          <a href="/product/44" className="shop-button">
            Mua ngay
          </a>
        </div>
        <div className="image-column">
          <img
            src="../../../iphone16.png"
            alt="IPhone 16 Plus"
            className="product-image"
          />
        </div>
      </div>
    </div>
  );
}

export default Banner;
