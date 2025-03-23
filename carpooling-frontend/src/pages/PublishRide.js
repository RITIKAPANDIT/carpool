import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRide } from '../services/api';
import '../styles/PublishRide.css';

const PublishRide = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropLocation: '',
    departureTime: '',
    availableSeats: 1,
    pricePerSeat: '',
    description: '',
    vehicleDetails: {
      model: '',
      licensePlate: ''
    },
    preferences: {
      music: false,
      smoking: false,
      petFriendly: false,
      genderPreference: 'any'
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const updateValue = type === 'checkbox' ? checked : value;
      
      // Handle nested object properties
      if (name.includes('.')) {
        const [parentKey, childKey] = name.split('.');
        return {
          ...prev,
          [parentKey]: {
            ...prev[parentKey],
            [childKey]: updateValue
          }
        };
      }
      
      return {
        ...prev,
        [name]: updateValue
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form data
      if (!formData.pickupLocation.trim() || !formData.dropLocation.trim()) {
        throw new Error('Please enter both pickup and drop locations');
      }

      if (!formData.departureTime) {
        throw new Error('Please select departure time');
      }

      if (formData.availableSeats < 1) {
        throw new Error('Please enter at least 1 available seat');
      }

      if (formData.pricePerSeat < 0) {
        throw new Error('Price per seat cannot be negative');
      }

      // Parse departure time
      const departureTime = new Date(formData.departureTime);
      if (departureTime < new Date()) {
        throw new Error('Cannot publish ride for past date/time');
      }

      // Validate vehicle details
      if (!formData.vehicleDetails.model.trim() || !formData.vehicleDetails.licensePlate.trim()) {
        throw new Error('Please enter vehicle details');
      }

      // Prepare ride data
      const rideData = {
        pickupLocation: formData.pickupLocation.trim(),
        dropLocation: formData.dropLocation.trim(),
        departureTime: departureTime.toISOString(),
        availableSeats: parseInt(formData.availableSeats),
        pricePerSeat: parseFloat(formData.pricePerSeat),
        description: formData.description.trim(),
        driver: user.id,
        vehicleDetails: {
          model: formData.vehicleDetails.model.trim(),
          licensePlate: formData.vehicleDetails.licensePlate.trim()
        },
        preferences: {
          music: formData.preferences.music,
          smoking: formData.preferences.smoking,
          petFriendly: formData.preferences.petFriendly,
          genderPreference: formData.preferences.genderPreference
        }
      };

      // Create ride
      await createRide(rideData);
      navigate('/');

    } catch (err) {
      console.error('Publish ride error:', err);
      setError(err.message || 'Failed to publish ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="publish-container">
      <div className="publish-card">
        <h2>Publish a Ride</h2>
        <form onSubmit={handleSubmit} className="publish-form">
          <div className="form-group">
            <label htmlFor="pickupLocation">Pickup Location</label>
            <input
              id="pickupLocation"
              type="text"
              name="pickupLocation"
              value={formData.pickupLocation}
              onChange={handleChange}
              placeholder="Enter pickup location"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dropLocation">Drop Location</label>
            <input
              id="dropLocation"
              type="text"
              name="dropLocation"
              value={formData.dropLocation}
              onChange={handleChange}
              placeholder="Enter drop location"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="departureTime">Departure Time</label>
            <input
              id="departureTime"
              type="datetime-local"
              name="departureTime"
              value={formData.departureTime}
              onChange={handleChange}
              min={new Date().toISOString().slice(0, 16)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="availableSeats">Available Seats</label>
              <input
                id="availableSeats"
                type="number"
                name="availableSeats"
                value={formData.availableSeats}
                onChange={handleChange}
                min="1"
                max="8"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="pricePerSeat">Price per Seat (₹)</label>
              <input
                id="pricePerSeat"
                type="number"
                name="pricePerSeat"
                value={formData.pricePerSeat}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Vehicle Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="vehicleModel">Vehicle Model</label>
                <input
                  id="vehicleModel"
                  type="text"
                  name="vehicleDetails.model"
                  value={formData.vehicleDetails.model}
                  onChange={handleChange}
                  placeholder="e.g., Hyundai Creta"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="licensePlate">License Plate</label>
                <input
                  id="licensePlate"
                  type="text"
                  name="vehicleDetails.licensePlate"
                  value={formData.vehicleDetails.licensePlate}
                  onChange={handleChange}
                  placeholder="e.g., DL10AB1234"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Ride Preferences</h3>
            <div className="preferences-grid">
              <div className="preference-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="preferences.music"
                    checked={formData.preferences.music}
                    onChange={handleChange}
                  />
                  <span>Music Allowed</span>
                </label>
              </div>

              <div className="preference-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="preferences.smoking"
                    checked={formData.preferences.smoking}
                    onChange={handleChange}
                  />
                  <span>Smoking Allowed</span>
                </label>
              </div>

              <div className="preference-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="preferences.petFriendly"
                    checked={formData.preferences.petFriendly}
                    onChange={handleChange}
                  />
                  <span>Pet Friendly</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="genderPreference">Gender Preference</label>
              <select
                id="genderPreference"
                name="preferences.genderPreference"
                value={formData.preferences.genderPreference}
                onChange={handleChange}
                className="select-input"
              >
                <option value="any">Any</option>
                <option value="male">Male Only</option>
                <option value="female">Female Only</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Additional Details (Optional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add any additional details about the ride"
              rows="3"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="publish-button"
            disabled={loading}
          >
            {loading ? 'Publishing...' : 'Publish Ride'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PublishRide;