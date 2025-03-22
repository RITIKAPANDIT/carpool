// const axios = require("axios");

// const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// // ✅ Function to get optimized route from Google Directions API
// const getRouteFromGoogleMaps = async (pickup, drop) => {
//   try {
//     const response = await axios.get("https://maps.googleapis.com/maps/api/directions/json", {
//       params: {
//         origin: pickup, // e.g., "Delhi, India"
//         destination: drop, // e.g., "Noida, India"
//         key: GOOGLE_MAPS_API_KEY
//       }
//     });

//     const steps = response.data.routes[0].legs[0].steps;
//     return steps.map((step) => ({
//       lat: step.start_location.lat,
//       lng: step.start_location.lng
//     }));
//   } catch (error) {
//     console.error("Error fetching route from Google Maps:", error);
//     return [];
//   }
// };

// module.exports = { getRouteFromGoogleMaps };
const axios = require("axios");

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const getTravelTime = async (origin, destination) => {
  try {
    const response = await axios.get("https://maps.googleapis.com/maps/api/distancematrix/json", {
      params: {
        origins: `${origin.lat},${origin.lng}`,
        destinations: `${destination.lat},${destination.lng}`,
        key: GOOGLE_MAPS_API_KEY
      }
    });

    return response.data.rows[0].elements[0].duration.text; // Returns "30 mins", etc.
  } catch (error) {
    console.error("Error fetching travel time:", error);
    return "Unknown";
  }
};

module.exports = { getTravelTime };
