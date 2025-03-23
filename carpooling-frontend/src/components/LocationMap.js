import React, { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '300px',
  marginBottom: '1rem',
  borderRadius: '8px'
};

const defaultCenter = {
  lat: 20.5937,  // India's center approximately
  lng: 78.9629
};

const LocationMap = ({ onLocationSelect, initialLocation }) => {
  const [marker, setMarker] = useState(initialLocation || null);

  const getAddressFromLatLng = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const address = data.results[0];
        // Get the locality or sublocality or administrative area
        const locality = address.address_components.find(
          component => 
            component.types.includes('locality') || 
            component.types.includes('sublocality') ||
            component.types.includes('administrative_area_level_1')
        );
        return locality ? locality.long_name : address.formatted_address;
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const handleMapClick = useCallback(async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    
    const newLocation = {
      lat,
      lng
    };

    // Get the address name
    const name = await getAddressFromLatLng(lat, lng);
    if (name) {
      newLocation.name = name;
    }

    setMarker(newLocation);
    onLocationSelect(newLocation);
  }, [onLocationSelect]);

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={marker || defaultCenter}
        zoom={5}
        onClick={handleMapClick}
      >
        {marker && (
          <Marker
            position={marker}
            animation={window.google?.maps.Animation.DROP}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default LocationMap;