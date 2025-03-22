import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = ({ isLoggedIn, handleLogout }) => {
  return (
    <nav className="navbar">
      <div className="logo">🚗 Carpooling</div>
      <div className="nav-links">
        {isLoggedIn ? (
          <>
            <button onClick={handleLogout} className="btn">Logout</button>
            <Link to="/publish" className="btn">Publish Ride</Link>
          </>
        ) : (
          <>
            <Link to="/login" className="btn">Login</Link>
            <Link to="/signup" className="btn">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
