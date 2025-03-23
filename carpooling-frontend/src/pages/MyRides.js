import React, { useState, useEffect } from 'react';
import { getUserRides, acceptRideRequest, rejectRideRequest } from '../services/api';
import '../styles/MyRides.css';

const MyRides = () => {
  const [rides, setRides] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('joined');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadRides();
  }, []);

  // Initialize default structure if rides is null
  if (!rides && !loading && !error) {
    setRides({
      published: [],
      joined: [],
      requests: []
    });
  }

  const loadRides = async () => {
    try {
      setLoading(true);
      const response = await getUserRides();
      setRides(response);
    } catch (err) {
      setError(err.message || 'Failed to load rides');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (rideId, userId) => {
    try {
      await acceptRideRequest(rideId, userId);
      setNotification({
        type: 'success',
        message: 'Request accepted! Rider has been notified.'
      });
      await loadRides(); // Refresh rides after accepting
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to accept request'
      });
    }
  };

  const handleRejectRequest = async (rideId, userId) => {
    try {
      await rejectRideRequest(rideId, userId);
      setNotification({
        type: 'info',
        message: 'Request rejected. Rider has been notified.'
      });
      await loadRides(); // Refresh rides after rejecting
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to reject request'
      });
    }
  };

  if (loading) {
    return (
      <div className="my-rides-container">
        <div className="loading">Loading your rides...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-rides-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const hasNoRides = !rides || (
    rides.published.length === 0 &&
    rides.joined.length === 0 &&
    rides.requests.length === 0
  );

  if (!loading && hasNoRides) {
    return (
      <div className="my-rides-container">
        <div className="no-rides">
          <h2>No Rides Found</h2>
          <p>You haven't published or joined any rides yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-rides-container">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
          <button 
            className="close-notification"
            onClick={() => setNotification(null)}
          >
            ×
          </button>
        </div>
      )}

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'joined' ? 'active' : ''}`}
          onClick={() => setActiveTab('joined')}
        >
          Rides Joined
        </button>
        <button 
          className={`tab ${activeTab === 'published' ? 'active' : ''}`}
          onClick={() => setActiveTab('published')}
        >
          Rides Published
        </button>
        <button 
          className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Ride Requests {!loading && rides?.requests?.length > 0 && (
            <span className="request-badge">{rides.requests.length}</span>
          )}
        </button>
      </div>

      <div className="rides-grid">
        {rides && rides[activeTab]?.map((ride) => (
          <div key={ride._id} className="ride-card">
            <div className="ride-header">
              <h3>{ride.pickupLocation} → {ride.dropLocation}</h3>
              <span className={`ride-status ${ride.status}`}>{ride.status}</span>
            </div>

            <div className="ride-date">
              {new Date(ride.departureTime).toLocaleDateString()} at{' '}
              {new Date(ride.departureTime).toLocaleTimeString()}
            </div>

            <div className="ride-details">
              <div className="detail-row">
                <span className="label">Driver:</span>
                <span>{ride.creator?.fullName}</span>
              </div>
              
              <div className="detail-row">
                <span className="label">Vehicle:</span>
                <span>{ride.vehicleDetails.model} ({ride.vehicleDetails.licensePlate})</span>
              </div>

              <div className="detail-row">
                <span className="label">Price:</span>
                <span>₹{ride.pricePerSeat} per seat</span>
              </div>

              <div className="detail-row">
                <span className="label">Available Seats:</span>
                <span>{ride.availableSeats}</span>
              </div>

              {activeTab === 'published' && (
                <div className="passengers-section">
                  <h4>Passengers:</h4>
                  {ride.passengers.map(passenger => (
                    <div key={passenger._id} className="passenger-item">
                      <div className="passenger-info">
                        <span className="passenger-name">{passenger.fullName}</span>
                        <span className="passenger-gender">{passenger.gender}</span>
                      </div>
                    </div>
                  ))}
                  
                  {ride.requests?.length > 0 && (
                    <div className="requests-section">
                      <h4>Pending Requests:</h4>
                      {ride.requests.map(request => (
                        <div key={request._id} className="request-item">
                          <div className="requester-info">
                            <div className="requester-header">
                              <span className="requester-name">{request.fullName}</span>
                              <span className="requester-gender">{request.gender}</span>
                            </div>
                            <div className="requester-contact">
                              <span className="contact-item">
                                <i className="fas fa-envelope"></i> {request.email}
                              </span>
                              <span className="contact-item">
                                <i className="fas fa-phone"></i> {request.phoneNumber}
                              </span>
                            </div>
                            <div className="requester-preferences">
                              {request.preferences?.music && (
                                <span className="preference-tag">Music Lover</span>
                              )}
                              {request.preferences?.smoking && (
                                <span className="preference-tag">Smoker</span>
                              )}
                              {request.preferences?.petFriendly && (
                                <span className="preference-tag">Pet Friendly</span>
                              )}
                            </div>
                          </div>
                          <div className="request-actions">
                            <button
                              className="accept-btn"
                              onClick={() => handleAcceptRequest(ride._id, request._id)}
                            >
                              Accept
                            </button>
                            <button
                              className="reject-btn"
                              onClick={() => handleRejectRequest(ride._id, request._id)}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'requests' && ride.status === 'pending' && (
                <div className="request-status pending">
                  <div className="status-message">
                    Your request is pending approval
                  </div>
                  <div className="ride-info">
                    <p>Waiting for the host to respond to your request.</p>
                  </div>
                </div>
              )}

              {activeTab === 'requests' && ride.status === 'accepted' && (
                <div className="request-status accepted">
                  <div className="status-message">
                    Congratulations! Your request has been accepted.
                    <p>Have a safe journey!</p>
                  </div>
                  <div className="driver-contact">
                    <p>Host Contact: {ride.creator?.phoneNumber || 'Not available'}</p>
                    <p>Vehicle: {ride.vehicleDetails.model} ({ride.vehicleDetails.licensePlate})</p>
                  </div>
                </div>
              )}

              {activeTab === 'requests' && ride.status === 'rejected' && (
                <div className="request-status rejected">
                  <div className="status-message">
                    Your request was not accepted for this ride
                  </div>
                  <div className="recommendation">
                    <p>Don't worry! You can try finding another ride that matches your requirements.</p>
                  </div>
                </div>
              )}

              <div className="preferences">
                {ride.preferences.music && (
                  <span className="preference-tag">Music</span>
                )}
                {ride.preferences.smoking && (
                  <span className="preference-tag">Smoking</span>
                )}
                {ride.preferences.petFriendly && (
                  <span className="preference-tag">Pet Friendly</span>
                )}
                {ride.preferences.genderPreference !== 'any' && (
                  <span className="preference-tag">
                    {ride.preferences.genderPreference} Only
                  </span>
                )}
              </div>
            </div>

            {ride.description && (
              <div className="ride-description">
                <p>{ride.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyRides;