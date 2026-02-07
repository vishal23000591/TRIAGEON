import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/images/logo.png";
import "../styles/navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <img src={logo} alt="TRIAGEON Logo" className="nav-logo-img" />
        <span className="nav-logo-text">TRIAGEON</span>
      </div>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/predictions">Predictions</Link>
      </div>
    </nav>
  );
}
