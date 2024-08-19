import React from "react";
import { Link } from "react-router-dom";
import "./style.css";

function BreadCrumb({ categoryName }) {
  return (
    <nav className="breadcrumb">
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>{categoryName}</li>
      </ul>
    </nav>
  );
}

export default BreadCrumb;
