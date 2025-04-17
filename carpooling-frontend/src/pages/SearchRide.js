import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationMap from '../components/LocationMap';
import { searchRides, joinRide } from '../services/api';
import '../styles/SearchRide.css';

const SearchRide = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    origin: '',
    destination: '',
    date: '',
    seats: 1,
    pickupLat: '',
    pickupLng: '',
    dropLat: '',
    dropLng: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle pickup location selection
  const handlePickupSelect = (location) => {
    setSearchData(prev => ({
      ...prev,
      origin: location.name,
      pickupLat: location.lat,
      pickupLng: location.lng
    }));
  };

  // Handle drop location selection
  const handleDropSelect = (location) => {
    setSearchData(prev => ({
      ...prev,
      destination: location.name,
      dropLat: location.lat,
      dropLng: location.lng
    }));
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Search for rides
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const rides = await searchRides(searchData);
      setSearchResults(rides);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Request to join a ride
  const handleJoinRequest = async (rideId) => {
    try {
      setError('');
      await joinRide(rideId);

      // Update the UI to show request sent
      setSearchResults(prev => 
        prev.map(ride => 
          ride._id === rideId 
            ? { ...ride, requestSent: true }
            : ride
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="search-ride-container">
      <div className="content-wrapper">
        <h2>Search for Rides</h2>
        
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="location-section">
              <div className="location-input">
                <label>Pickup Location</label>
                <LocationMap 
                  onLocationSelect={handlePickupSelect}
                  placeholder="Enter pickup location"
                  initialValue={searchData.origin}
                />
              </div>
              
              <div className="location-input">
                <label>Drop Location</label>
                <LocationMap 
                  onLocationSelect={handleDropSelect}
                  placeholder="Enter drop location"
                  initialValue={searchData.destination}
                />
              </div>
            </div>

            <div className="details-section">
              <div className="form-group">
                <label>Date & Time</label>
                <input
                  type="datetime-local"
                  name="date"
                  value={searchData.date}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Number of Seats</label>
                <input
                  type="number"
                  name="seats"
                  min="1"
                  max="6"
                  value={searchData.seats}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
            </div>

            <button type="submit" className="search-button" disabled={loading}>
              {loading ? 'Searching...' : 'Search Rides'}
            </button>
          </form>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="results-section">
          {searchResults.length > 0 ? (
            <div className="rides-grid">
              {searchResults.map(ride => (
                <div key={ride._id} className="ride-card">
                  <div className="ride-header">
                    <div className="driver-info">
                      <h3>{ride.creator.fullName}</h3>
                      <span className="gender-badge">{ride.creator.gender}</span>
                    </div>
                    <div className="match-score">
                      <span className="score-label">Match</span>
                      <span className="score-value">{Math.round(ride.score)}%</span>
                    </div>
                  </div>
                  
                  <div className="ride-details">
                    <div className="location-detail">
                      <i className="location-icon">📍</i>
                      <div className="location-text">
                        <p className="location-label">From</p>
                        <p className="location-value">{ride.pickupLocation.name}</p>
                      </div>
                    </div>
                    
                    <div className="location-detail">
                      <i className="location-icon">🏁</i>
                      <div className="location-text">
                        <p className="location-label">To</p>
                        <p className="location-value">{ride.dropLocation.name}</p>
                      </div>
                    </div>

                    <div className="ride-info-grid">
                      <div className="info-item">
                        <span className="info-label">Date</span>
                        <span className="info-value">
                          {new Date(ride.departureTime).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Time</span>
                        <span className="info-value">
                          {new Date(ride.departureTime).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Seats</span>
                        <span className="info-value">{ride.availableSeats}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Price</span>
                        <span className="info-value">₹{ride.pricePerSeat}</span>
                      </div>
                    </div>
                  </div>

                  <div className="ride-footer">
                    {ride.requestSent ? (
                      <button className="request-sent-button" disabled>
                        Request Sent
                      </button>
                    ) : (
                      <button
                        className="join-button"
                        onClick={() => handleJoinRequest(ride._id)}
                      >
                        Request to Join
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            searchData.origin && searchData.destination && !loading && 
            <div className="no-results">
              <p>No rides found matching your criteria</p>
              <p className="suggestion">Try adjusting your search parameters or check back later</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchRide;