import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/PublishRide.css";

const PublishRide = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [seats, setSeats] = useState(1);
  const [price, setPrice] = useState("");
  const navigate = useNavigate();

  const handlePublish = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/publish-ride", {
        from,
        to,
        date,
        seats,
        price,
      });
      alert("Ride Published Successfully!");
      navigate("/");
    } catch (error) {
      alert("Failed to publish ride.");
    }
  };

  return (
    <div className="publish-container">
      <h2>Publish a Ride</h2>
      <form onSubmit={handlePublish}>
        <input type="text" placeholder="Leaving from" value={from} onChange={(e) => setFrom(e.target.value)} required />
        <input type="text" placeholder="Going to" value={to} onChange={(e) => setTo(e.target.value)} required />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        <input type="number" min="1" value={seats} onChange={(e) => setSeats(e.target.value)} required />
        <input type="text" placeholder="Price per seat" value={price} onChange={(e) => setPrice(e.target.value)} required />
        <button type="submit">Publish Ride</button>
      </form>
    </div>
  );
};

export default PublishRide;
