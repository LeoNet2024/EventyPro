import React, { useState, useEffect } from "react";
import categories from "../../../data/sport_categories";
import cities from "../../../data/full_israeli_cities";
import axios from "axios";

import classes from "./NewEvent.module.css";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";
// components for create new event
export default function NewEvent() {
  // for navigate after event created
  const navigate = useNavigate();

  // user details
  const { user } = useAuth();

  const [cities, setCities] = useState([]);

  const catOptions = categories.map((el, idx) => {
    return <option key={idx}>{el}</option>;
  });

  // import  cities from cities table
  useEffect(() => {
    axios
      .get("/login/cities")
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

  // form details
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

  // handle change
  function handleChange(e) {
    setEventDea((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
      user_id: user.user_id,
    }));
  }

  // hande submit
  function handleSubmit(e) {
    e.preventDefault();

    axios
      .post("/newEvent", eventDea)
      .then((res) => {
        alert("event created");
        navigate("/");
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  return (
    <div>
      <main>
        <h2>create new event</h2>
        <form
          action=""
          method="post"
          onSubmit={handleSubmit}
          className={classes.formWrap}
        >
          <label>Event name</label>
          <input
            type="text"
            name="eventName"
            onChange={(e) => handleChange(e)}
          />
          <label>city</label>
          <select name="city" onChange={(e) => handleChange(e)}>
            <option></option>
            {cities.map((el, idx) => {
              return <option key={idx}>{el.name_heb}</option>;
            })}
          </select>
          <label>category</label>
          <select name="category" onChange={(e) => handleChange(e)}>
            <option></option>
            {catOptions}
          </select>
          <label>participants</label>
          <input
            type="text"
            name="participantAmount"
            maxLength={3}
            onChange={(e) => handleChange(e)}
          />
          <label>start date</label>
          <input
            type="date"
            onChange={(e) => handleChange(e)}
            name="startDate"
          />
          <label>End date</label>
          <input type="date" onChange={(e) => handleChange(e)} name="endDate" />
          <label>start time</label>
          <input
            type="time"
            name="startTime"
            onChange={(e) => handleChange(e)}
          />
          <label>type of event</label>
          <select name="type" onChange={(e) => handleChange(e)}>
            <option></option>
            <option value="private">private</option>
            <option value="public">public</option>
          </select>
          <button type="submit">create event</button>
        </form>
      </main>
    </div>
  );
}
