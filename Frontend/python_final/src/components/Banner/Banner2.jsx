import "./banner2.css"

function Banner2() {
    return (
        <div className="banner-container2 position-relative">
            <img
                src="/photos/Banner2.png"
                alt="IPhone 14 Pro"
                className="img-fluid w-100"
            />
            <div className="text-overlay position-absolute top-50 start-50 translate-middle text-white text-center">
                <h2 className="Textline">
                    <span className="type2 f-abril">Big</span>
                    <span className="subtype f-abril">Sale</span>
                </h2>
                <p className="description">
                    Luôn luôn lắng nghe, luôn luôn thấu hiểu
                </p>
                <a href="/product" className="Shop btn btn-outline-secondary text-white">
                    Mua ngay
                </a>
            </div>
        </div>

    );
}

export default Banner2;