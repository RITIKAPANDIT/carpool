import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendEmergencyAlert } from '../services/api';
import '../styles/Navbar.css';

// Car logo SVG component
const CarLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
    <path d="M21.7,12.3l-1.7-3.9c-0.3-0.7-1-1.1-1.8-1.1H5.8c-0.8,0-1.5,0.4-1.8,1.1l-1.7,3.9C2.1,12.1,2,12.3,2,12.5v4C2,16.8,2.2,17,2.5,17h1C3.8,17,4,16.8,4,16.5V16h16v0.5c0,0.3,0.2,0.5,0.5,0.5h1c0.3,0,0.5-0.2,0.5-0.5v-4C22,12.3,21.9,12.1,21.7,12.3z M6.9,13.5c-0.8,0-1.5-0.7-1.5-1.5s0.7-1.5,1.5-1.5s1.5,0.7,1.5,1.5S7.7,13.5,6.9,13.5z M17.1,13.5c-0.8,0-1.5-0.7-1.5-1.5s0.7-1.5,1.5-1.5s1.5,0.7,1.5,1.5S17.9,13.5,17.1,13.5z"/>
  </svg>
);

const Navbar = ({ isLoggedIn, handleLogout }) => {
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);

  const onLogout = () => {
    handleLogout();
    navigate('/');
  };

  const handleEmergency = async () => {
    if (window.confirm('Are you sure you want to trigger an emergency alert? This will notify authorities of your current location.')) {
      try {
        setSending(true);
        // Get current location
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        await sendEmergencyAlert({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date().toISOString()
        });

        alert('Emergency alert sent. Authorities have been notified. Stay calm and help is on the way.');
      } catch (error) {
        console.error('Emergency alert error:', error);
        alert('Failed to send emergency alert. Please call emergency services directly.');
      } finally {
        setSending(false);
      }
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <CarLogo />
        <span className="brand-text">Carpooling</span>
      </Link>

      <div className="nav-buttons">
        {isLoggedIn ? (
          <>
            <Link to="/publish" className="nav-button publish-button">
              Publish Ride
            </Link>
            <Link to="/search" className="nav-button">
              Search Rides
            </Link>
            <Link to="/myrides" className="nav-button">
              My Rides
            </Link>
            <button 
              onClick={handleEmergency} 
              className="nav-button emergency-button"
              disabled={sending}
            >
              {sending ? 'Sending Alert...' : (
                <>
                  <i className="fas fa-exclamation-triangle"></i>
                  Emergency
                </>
              )}
            </button>
            <button onClick={onLogout} className="nav-button logout-button">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-button">
              Login
            </Link>
            <Link to="/signup" className="nav-button signup-button">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;