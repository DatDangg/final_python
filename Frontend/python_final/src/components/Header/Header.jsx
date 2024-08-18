import React from 'react';
import { Link } from 'react-router-dom'; // Import Link từ react-router-dom
import './style.css';

export const Header = () => {
  return (
    <header className="header-top">
      <img className="logo" alt="Logo" src="../../../logo.jpg" />
      <div className="search-field">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="icon-search">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input className="search-input" type="text" placeholder="Search" />
      </div>
      <nav className="navbar">
        <Link to="/" className="nav-item active">Home</Link>
        <Link to="/about" className="nav-item">About</Link>
        <Link to="/contact" className="nav-item">Contact Us</Link>
        <Link to="/blog" className="nav-item">Blog</Link>
      </nav>
      <div className="icons">
        <svg className="icon" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" />
        </svg>
        <svg className="icon" viewBox="0 0 24 24">
          <path d="M7 4v2h14V4M3 4v2h2l3.6 7.59-1.35 2.45C6.9 16.37 7 16.68 7 17v2c0 .55.45 1 1 1h12v-2H8.42c-.14 0-.25-.11-.26-.25l.03-.12L9.1 14h7.45c.75 0 1.41-.41 1.75-1.04L21.92 7H5.21L4.27 5H3M7 18v2h10v-2H7z" fill="currentColor" />
        </svg>
        <svg className="icon" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor" />
        </svg>
      </div>
    </header>
  );
};
