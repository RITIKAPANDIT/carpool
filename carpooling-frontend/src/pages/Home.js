import React, { useState } from 'react';
import { searchRides, joinRide } from '../services/api';
import LocationMap from '../components/LocationMap';
import '../styles/Home.css';

const Home = ({ isLoggedIn }) => {
  const [searchData, setSearchData] = useState({
    leavingFrom: '',
    goingTo: '',
    date: '',
    passengers: 1,
    pickupLocation: null,
    dropLocation: null
  });

  const [showingMap, setShowingMap] = useState(null); // 'pickup' or 'drop' or null
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const [joinLoading, setJoinLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate that locations are selected on map
      if (!searchData.pickupLocation || !searchData.dropLocation) {
        throw new Error('Please select both pickup and drop locations on the map');
      }

      const results = await searchRides({
        origin: searchData.leavingFrom,
        destination: searchData.goingTo,
        date: searchData.date,
        seats: searchData.passengers,
        pickupLat: searchData.pickupLocation.lat,
        pickupLng: searchData.pickupLocation.lng,
        dropLat: searchData.dropLocation.lat,
        dropLng: searchData.dropLocation.lng
      });

      if (Array.isArray(results)) {
        setSearchResults(results);
      } else {
        setError('No rides found matching your criteria');
        setSearchResults([]);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRide = async (rideId) => {
    if (joinLoading) return;
    
    setJoinLoading(true);
    setError('');

    try {
      await joinRide(rideId);
      
      // Remove the joined ride from results
      setSearchResults(prev =>
        prev.filter(ride => ride._id !== rideId)
      );

      alert('Successfully joined the ride!');
    } catch (error) {
      setError(error.message || 'Failed to join ride');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Component for the welcome screen (before login)
  const WelcomeScreen = () => (
    <div className="welcome-section">
      <h1>Welcome to Carpooling</h1>
      <p className="welcome-text">Let's have fun and book a ride.</p>
      <div className="welcome-image">
        <img src="/images/carpool-hero.jpg" alt="Carpooling" />
      </div>
    </div>
  );

  // Component for ride search (after login)
  const RideSearch = () => (
    <div className="search-section">
      <h2>Find Your Perfect Ride</h2>
      <form onSubmit={handleSearch} className="search-form">
        <div className="form-group">
          <label>Leaving From</label>
          <div className="location-input">
            <input
              type="text"
              name="leavingFrom"
              value={searchData.leavingFrom}
              onChange={handleInputChange}
              placeholder="Enter city or location"
              required
            />
            <button
              type="button"
              className="map-button"
              onClick={() => setShowingMap('pickup')}
            >
              📍 Pick on Map
            </button>
          </div>
          {showingMap === 'pickup' && (
            <div className="map-container">
              <LocationMap
                onLocationSelect={(location) => {
                  setSearchData(prev => ({
                    ...prev,
                    pickupLocation: location,
                    leavingFrom: location.name || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                  }));
                  setShowingMap(null);
                }}
                initialLocation={searchData.pickupLocation}
              />
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Going To</label>
          <div className="location-input">
            <input
              type="text"
              name="goingTo"
              value={searchData.goingTo}
              onChange={handleInputChange}
              placeholder="Enter destination"
              required
            />
            <button
              type="button"
              className="map-button"
              onClick={() => setShowingMap('drop')}
            >
              📍 Pick on Map
            </button>
          </div>
          {showingMap === 'drop' && (
            <div className="map-container">
              <LocationMap
                onLocationSelect={(location) => {
                  setSearchData(prev => ({
                    ...prev,
                    dropLocation: location,
                    goingTo: location.name || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                  }));
                  setShowingMap(null);
                }}
                initialLocation={searchData.dropLocation}
              />
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={searchData.date}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label>Passengers</label>
            <input
              type="number"
              name="passengers"
              value={searchData.passengers}
              onChange={handleInputChange}
              min="1"
              max="8"
              required
            />
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="search-button" disabled={loading}>
          {loading ? 'Searching...' : 'Search Rides'}
        </button>
      </form>

      {searchResults.length > 0 && (
        <div className="search-results">
          <h3>Available Rides</h3>
          <div className="rides-list">
            {searchResults.map((ride) => (
              <div key={ride._id} className="ride-card">
                <div className="ride-info">
                  <div className="ride-header">
                    <h4>{ride.pickupLocation} → {ride.dropLocation}</h4>
                    <span className="match-score">
                      {Math.round(ride.score)}% Match
                    </span>
                  </div>
                  <p className="ride-date">
                    <span>📅</span> {new Date(ride.departureTime).toLocaleDateString()} at{' '}
                    {new Date(ride.departureTime).toLocaleTimeString()}
                  </p>
                  <div className="driver-info">
                    <span>👤</span> {ride.creator?.fullName}
                  </div>
                  <div className="ride-details">
                    <p>
                      <span>💺</span> {ride.availableSeats} seats available
                    </p>
                    <p className="ride-price">
                      <span>💰</span> ₹{ride.pricePerSeat} per seat
                    </p>
                  </div>
                  {ride.preferences && (
                    <div className="preferences">
                      {ride.preferences.music && <span className="pref-tag">🎵 Music</span>}
                      {ride.preferences.smoking && <span className="pref-tag">🚬 Smoking</span>}
                      {ride.preferences.petFriendly && <span className="pref-tag">🐾 Pet Friendly</span>}
                      {ride.preferences.genderPreference !== 'any' && (
                        <span className="pref-tag">
                          {ride.preferences.genderPreference === 'male' ? '👨' : '👩'}
                          {ride.preferences.genderPreference} Only
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <button
                  className="join-button"
                  onClick={() => handleJoinRide(ride._id)}
                  disabled={joinLoading}
                >
                  {joinLoading ? 'Joining...' : 'Join Ride'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="home-container">
      {!isLoggedIn ? <WelcomeScreen /> : <RideSearch />}
    </div>
  );
};

export default Home;