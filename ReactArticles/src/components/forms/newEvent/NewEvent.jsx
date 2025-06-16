import React, { useState, useEffect } from "react";
import categories from "../../../data/sport_categories";
import axios from "axios";
import classes from "./NewEvent.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

export default function NewEvent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cities, setCities] = useState([]);

  useEffect(() => {
    axios
      .get("/register/cities")
      .then((res) => {
        const validCities = res.data.filter(
          (el) => el.name_heb && el.name_heb.trim().length > 0
        );
        setCities(validCities);
      })
      .catch((err) => {
        console.error("Error fetching cities:", err);
      });
  }, []);

  const [eventDea, setEventDea] = useState({
    eventName: "",
    city: "",
    category: "",
    participantAmount: "",
    startDate: "",
    endDate: "",
    startTime: "",
    type: "",
    user_id: "",
  });

  function handleChange(e) {
    setEventDea((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
      user_id: user.user_id,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    axios
      .post("/newEvent", eventDea)
      .then(() => {
        alert("Event created");
        navigate("/");
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  return (
    <div className={classes.backdrop}>
      <main className={classes.main}>
        <h2>Create New Event</h2>
        <form onSubmit={handleSubmit} className={classes.formWrap}>
          <label>Event Name</label>
          <input
            type="text"
            name="eventName"
            value={eventDea.eventName}
            onChange={handleChange}
            required
          />

          <label>City</label>
          <select name="city" onChange={handleChange} required>
            <option value="">-- Select City --</option>
            {cities.map((el, idx) => (
              <option key={idx} value={el.name_heb}>
                {el.name_heb}
              </option>
            ))}
          </select>

          <label>Category</label>
          <select name="category" onChange={handleChange} required>
            <option value="">-- Select Category --</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <label>Participants</label>
          <input
            type="number"
            name="participantAmount"
            value={eventDea.participantAmount}
            maxLength={3}
            onChange={handleChange}
            required
          />

          <label>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={eventDea.startDate}
            onChange={handleChange}
            required
          />

          <label>End Date</label>
          <input
            type="date"
            name="endDate"
            value={eventDea.endDate}
            onChange={handleChange}
            required
          />

          <label>Start Time</label>
          <input
            type="time"
            name="startTime"
            value={eventDea.startTime}
            onChange={handleChange}
            required
          />

          <label>Type of Event</label>
          <select name="type" onChange={handleChange} required>
            <option value="">-- Select Type --</option>
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>

          <button type="submit">Create Event</button>
        </form>
      </main>
    </div>
  );
}
