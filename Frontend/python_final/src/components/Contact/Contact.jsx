import "./Contact.css"
import {Link} from "react-router-dom";
import React from "react";

function Contact(){
    return(
        <div className="container">
            <div className="row contact">
                <div className="top text-center pt-5">
                    <h1 className="f-abril ">Contact Us</h1>
                    <p>Đội ngũ hỗ trợ khách hàng của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7!</p>
                </div>
                <div className="bottom text-center container">
                    <div className="row d-flex justify-content-center align-items-center">
                        <div className="col-md-4">
                            <svg width="50" height="50" viewBox="0 0 1024 1024" className="icon"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M800 416a288 288 0 1 0 -576 0c0 118.144 94.528 272.128 288 456.576C705.472 688.128 800 534.144 800 416M512 960C277.312 746.688 160 565.312 160 416a352 352 0 0 1 704 0c0 149.312 -117.312 330.688 -352 544"/>
                                <path
                                    d="M512 512a96 96 0 1 0 0 -192 96 96 0 0 0 0 192m0 64a160 160 0 1 1 0 -320 160 160 0 0 1 0 320"/>
                            </svg>
                            <h5 className="f-abril text-uppercase text-secondary pt-3 mb-2">Address</h5>
                            <p>Ngã 5 của những người cô đơn</p>
                        </div>
                        <div className="col-md-4">
                            <svg width="50" height="50" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
                                 xmlnsXlink="http://www.w3.org/1999/xlink"
                                 viewBox="0 0 32 32" enable-background="new 0 0 32 32" xml:space="preserve">
                                <path fill="none" stroke="#000000" strokeWidth="2" stroke-miterlimit="10" d="M13.6,8.5L9.5,4.3C9,3.9,8.3,3.9,7.8,4.3L4.7,7.5
                                    C4,8.1,3.8,9.1,4.1,9.9c0.8,2.3,2.9,6.9,7,11s8.7,6.1,11,7c0.9,0.3,1.8,0.1,2.5-0.5l3.1-3.1c0.5-0.5,0.5-1.2,0-1.7l-4.1-4.1
                                    c-0.5-0.5-1.2-0.5-1.7,0l-2.5,2.5c0,0-2.8-1.2-5-3.3s-3.3-5-3.3-5l2.5-2.5C14.1,9.7,14.1,8.9,13.6,8.5z"/>
                            </svg>
                            <h5 className="f-abril text-uppercase text-secondary pt-3 mb-2">Phone</h5>
                            <p>0876164202</p>
                        </div>
                        <div className="col-md-4">
                            <svg fill="#000000" width="50px" height="50px" viewBox="0 0 36 36" version="1.1"
                                 preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg"
                                 xmlnsXlink="http://www.w3.org/1999/xlink">
                                <title>email-line</title>
                                <path className="clr-i-outline clr-i-outline-path-1"
                                      d="M32,6H4A2,2,0,0,0,2,8V28a2,2,0,0,0,2,2H32a2,2,0,0,0,2-2V8A2,2,0,0,0,32,6ZM30.46,28H5.66l7-7.24-1.44-1.39L4,26.84V9.52L16.43,21.89a2,2,0,0,0,2.82,0L32,9.21v17.5l-7.36-7.36-1.41,1.41ZM5.31,8H30.38L17.84,20.47Z"></path>
                                <rect x="0" y="0" width="36" height="36" fill-opacity="0"/>
                            </svg>
                            <h5 className="f-abril text-uppercase text-secondary pt-3 mb-2">Email</h5>
                            <p>A42329@thanglong.edu.vn</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Contact;