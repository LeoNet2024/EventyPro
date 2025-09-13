// Component for creating a new event
import React, { useState, useEffect } from "react";
import axios from "axios";
import classes from "./NewEvent.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

export default function NewEvent() {
  console.log("new event()");
  // const today used to set the current day and to disable expired day
  const today = new Date().toISOString().split("T")[0];
  const navigate = useNavigate();
  const { user } = useAuth();

  // List of cities and categories for the dropdowns
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);

  // Message to display (success or error)
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Form data state
  const [eventData, setEventData] = useState({
    eventName: "",
    city: "",
    category: "",
    participantAmount: "",
    startDate: "",
    endDate: "",
    startTime: "",
    type: "",
    user_id: "",
    description: "",
  });

  // Fetch cities and categories when component mounts
  useEffect(() => {
    fetchCities();
    fetchCategories();
  }, []);

  // Automatically clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // ----------------------------------------
  // Fetch list of cities from the backend
  function fetchCities() {
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
  }

  // Fetch list of categories from the backend
  function fetchCategories() {
    axios
      .get("/newEvent/getCategories")
      .then((res) => {
        setCategories(res.data);
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }

  // ----------------------------------------
  // Handle changes in the form inputs
  function handleChange(e) {
    setEventData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
      user_id: user.user_id,
    }));
  }

  // ----------------------------------------
  // Handle form submission and send data to backend
  function handleSubmit(e) {
    e.preventDefault();

    axios
      .post("/newEvent", eventData)
      .then(() => {
        setMessage("Event created successfully!");
        setMessageType("success");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      })
      .catch((error) => {
        console.error("Error:", error);
        const msg =
          error.response?.data ||
          "An unexpected error occurred while creating the event.";
        setMessage(msg);
        setMessageType("error");
      });
  }

  // ----------------------------------------
  // Render the form
  return (
    <div className={classes.backdrop}>
      {message && (
        <div
          className={
            messageType === "success"
              ? classes.successMessage
              : classes.errorMessage
          }
        >
          {message}
        </div>
      )}
      <main className={classes.main}>
        <h2>Create New Event</h2>
        <form onSubmit={handleSubmit} className={classes.formWrap}>
          <label>Event Name</label>
          <input
            type="text"
            name="eventName"
            value={eventData.eventName}
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

          <label>Description</label>
          <textarea
            name="description"
            value={eventData.description}
            onChange={handleChange}
            rows={4}
            maxLength={500} // 3) Optional safeguard
            placeholder="Write a short description for your event"
            className={classes.textarea} // optional style hook if you want
            required
          />

          {/* 3) Optional live counter */}
          <small>{eventData.description.length}/500</small>

          <label>Category</label>
          <select name="category" onChange={handleChange} required>
            <option value="">-- Select Category --</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat.category}>
                {cat.category}
              </option>
            ))}
          </select>

          <label>Participants</label>
          <input
            type="number"
            name="participantAmount"
            value={eventData.participantAmount}
            maxLength={3}
            min={1}
            onChange={handleChange}
            required
          />

          <label>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={eventData.startDate}
            onChange={handleChange}
            min={today}
            required
          />

          <label>End Date</label>
          <input
            type="date"
            name="endDate"
            min={eventData.startDate}
            value={eventData.endDate}
            onChange={handleChange}
            required
          />

          <label>Start Time</label>
          <input
            type="time"
            name="startTime"
            value={eventData.startTime}
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
