import React, { useState, useContext } from 'react';
import axios from 'axios';
import {Link, useNavigate} from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const apiurl = import.meta.env.VITE_REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiurl}/auth/login/`, {
        username,
        password,
      });
      login(response.data.token);
      navigate('/');
    } catch (err) {
      console.error(err.response);
      setError('Invalid credentials');
    }
  };

  return (
      <div className="container-fluid">
        <div className="row d-flex section">
          <div className="col-md-7 login-section d-flex align-items-center justify-content-center">
            <div className="login-box mx-auto text-center">
              <div className="login">
                <h1 className="f-prata">Login</h1>
                <form onSubmit={handleSubmit}>
                  <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                  />
                  <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                  />
                  <Link className="fwp f-inter" to="/auth/forgot-password">
                    Forgot Password
                  </Link>
                  <button type="submit f-inter">Login</button>
                  <Link className="f-inter back text-end text-decoration-underline" to="/auth">
                    Back
                  </Link>
                  {error && <p>{error}</p>}
                </form>
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

  )
      ;
};

export default Login;
