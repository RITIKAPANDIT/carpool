import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const Home = ({ isLoggedIn }) => {
  const [leavingFrom, setLeavingFrom] = useState("");
  const [goingTo, setGoingTo] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const navigate = useNavigate();

  const handleSearch = () => {
    alert(`Searching rides from ${leavingFrom} to ${goingTo} on ${date} for ${passengers} passenger(s).`);
  };

  return (
    <div className="home-container">
      {!isLoggedIn ? (
        // BEFORE LOGIN UI
        <>
          <h1>Welcome to Carpooling</h1>
          <p>Let's have fun and book a ride.</p>
        </>
      ) : (
        // AFTER LOGIN UI
        <>
          <h2>Your pick of rides at low prices</h2>
          <div className="ride-search">
            <input type="text" placeholder="Leaving from" value={leavingFrom} onChange={(e) => setLeavingFrom(e.target.value)} />
            <input type="text" placeholder="Going to" value={goingTo} onChange={(e) => setGoingTo(e.target.value)} />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <input type="number" min="1" value={passengers} onChange={(e) => setPassengers(e.target.value)} />
            <button onClick={handleSearch}>Search</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
