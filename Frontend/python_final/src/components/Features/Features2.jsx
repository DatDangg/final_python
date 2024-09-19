import "./Features.css"
import React from "react";


function Features2() {
    return (
        <div className="container-fluid  pt-5">
            <div className="row features2 d-flex justify-content-center align-items-center">
                <div className="col-md-3 ban1">
                    <div className="text-center">
                        <img className="group1" src="/photos/Group1.png" alt=""/>
                    </div>
                    <div className="pl-5">
                        <h2>Popular Products</h2>
                    </div>
                    <div className="features-text pl-5">
                        <p>Với thiết kế hiện đại và đa dạng, chúng tôi tự tin cung cấp công nghệ mới nhất với giá cả cạnh tranh.</p>
                    </div>
                    <button  className="btn btn-outline-dark mb-4 pl-5"><a href="/product">Mua ngay</a></button>
                </div>
                <div className="col-md-3 ban2">
                    <div className="text-center">
                        <img className="group1" src="/photos/Group2.png" alt=""/>
                    </div>
                    <div className="pl-5">
                        <h2>Ipad Pro</h2>
                    </div>
                    <div className="features-text pl-5">
                        <p>
                            iPad kết hợp màn hình Retina 10,2 inch tuyệt đẹp, hiệu suất đáng kinh ngạc, đa nhiệm và dễ sử dụng.</p>
                    </div>
                    <button className="btn btn-outline-dark mb-4 pl-5"><a href="/product">Mua ngay</a></button>
                </div>
                <div className="col-md-3 ban3">
                    <div className="text-center">
                        <img className="group1" src="/photos/Group3.png" alt=""/>
                    </div>
                    <div className="pl-5">
                        <h2>Samsung Galaxy</h2>
                    </div>
                    <div className="features-text pl-5">
                        <p>Sở hữu màn hình lớn sắc nét, hiệu năng mạnh mẽ, hỗ trợ đa nhiệm vượt trội và mang lại sự tiện dụng tối đa.</p>
                    </div>
                    <button className="btn btn-outline-dark mb-4 pl-5" ><a href="/category/1">Mua ngay</a></button>
                </div>
                <div className="col-md-3 ban4">
                    <div className="text-center">
                        <img className="group1" src="/photos/Group4.png" alt=""/>
                    </div>
                    <div className="text-white pl-5">
                        <h2>Macbook Pro</h2>
                    </div>
                    <div className="text-gray features-text pl-5">
                        <p>
                            MacBook Pro trang bị màn hình Retina tuyệt đẹp, hiệu năng ấn tượng, khả năng đa nhiệm mượt mà và dễ dàng sử dụng.</p>
                    </div>
                    <button className="btn btn-outline-secondary mb-4 pl-5"><a href="/category/2">Mua ngay</a></button>
                </div>
            </div>
        </div>
    );
}

export default Features2;