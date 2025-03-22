const haversine = require("haversine-distance");

function calculateRouteMatch(riderRoute, driverRoute) {
  let matchedPoints = 0;

  for (let i = 0; i < riderRoute.length; i++) {
    for (let j = 0; j < driverRoute.length; j++) {
      const distance = haversine(
        { latitude: riderRoute[i].lat, longitude: riderRoute[i].lng },
        { latitude: driverRoute[j].lat, longitude: driverRoute[j].lng }
      );
      if (distance < 500) { // ✅ If within 500m, count as a match
        matchedPoints++;
        break;
      }
    }
  }

  return (matchedPoints / riderRoute.length) * 100; // ✅ Match percentage
}

module.exports = { calculateRouteMatch };
