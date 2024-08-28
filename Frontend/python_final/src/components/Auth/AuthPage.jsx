// src/components/Auth/AuthPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './authpage.css';

const AuthPage = () => {
  return (
    <div className="authpage">
      <h2>Welcome to Our App</h2>
      <p>Please choose an option:</p>
      <Link to="/auth/login">
        <button>Login</button>
      </Link>
      <Link to="/auth/signup">
        <button>Sign Up</button>
      </Link>
    </div>
  );
};

export default AuthPage;
