import React from 'react';
import { Link } from 'react-router-dom';
import './AuthPage.css';

function AuthPage(){
  return (
    <div className="authpage">
        <div className="container-fluid">
            <div className="row d-flex section">
                <div className="col-md-7 login-section d-flex align-items-center justify-content-center">
                    <div className="login-box mx-auto text-center">
                            <h3 className="f-inter">Please choose an option:</h3>
                            <div className="bt ">
                                <Link to="/auth/login">
                                    <button>Login</button>
                                </Link>
                            </div>
                            <div className="bt">
                                <Link to="/auth/signup">
                                    <button>Sign Up</button>
                                </Link>
                            </div>

                    </div>

                </div>
                <div className="col-md-5 d-flex image-section justify-content-center align-items-center ">
                    <div className="text-center">
                        <p className="text-white text-uppercase f-prata">Welcome</p>
                        <p className="text-white text-uppercase f-prata p-0">to our website !</p>
                        <img className="text-center" src="/photos/giohang.png" alt=""/>
                    </div>
                </div>
            </div>
        </div>

    </div>
  );
};

export default AuthPage;
