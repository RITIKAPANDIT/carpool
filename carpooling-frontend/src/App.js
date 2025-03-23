import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PublishRide from './pages/PublishRide';
import MyRides from './pages/MyRides';
import SearchRide from './pages/SearchRide';
import './App.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in on component mount
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
  };

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    if (!isLoggedIn) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <Router>
      <div className="app">
        <Navbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
        
        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={<Home isLoggedIn={isLoggedIn} user={user} />} 
            />
            
            <Route 
              path="/login" 
              element={
                isLoggedIn ? (
                  <Navigate to="/" />
                ) : (
                  <Login setIsLoggedIn={setIsLoggedIn} setUser={setUser} />
                )
              } 
            />
            
            <Route 
              path="/signup" 
              element={
                isLoggedIn ? (
                  <Navigate to="/" />
                ) : (
                  <Signup setIsLoggedIn={setIsLoggedIn} setUser={setUser} />
                )
              } 
            />
            
            <Route 
              path="/publish" 
              element={
                <ProtectedRoute>
                  <PublishRide user={user} />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/myrides" 
              element={
                <ProtectedRoute>
                  <MyRides user={user} />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/search" 
              element={
                <ProtectedRoute>
                  <SearchRide />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;