// Component for creating a new event
import React, { useState, useEffect } from "react";
import axios from "axios";
import classes from "./NewEvent.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import HalfHourTimeSelect from "./HalfHourTimeSelect";
import CityAutocomplete from "./CityAutocomplete";

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
    startTime: "",
    type: "",
    user_id: "",
    description: "",
    event_src: null,
  });

  // image state
  const [imageFile, setImageFile] = useState(null);

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

    if (imageFile) {
      const data = new FormData();
      data.append("file", imageFile);

      axios
        .post("/upload", data, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((up) => {
          const filename = up?.data?.file?.filename; // הגנה מ-undefined
          if (!filename)
            throw new Error("Upload succeeded but filename missing");

          return axios.post("/newEvent", {
            eventName: eventData.eventName,
            city: eventData.city,
            category: eventData.category,
            participantAmount: eventData.participantAmount,
            startDate: eventData.startDate,
            startTime: eventData.startTime,
            type: eventData.type,
            user_id: eventData.user_id,
            description: eventData.description,
            event_src: `/uploads/${filename}`,
          });
        })
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

      return; // חשוב: לא להמשיך למסלול ללא קובץ
    }
    // no image file
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

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
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
          <CityAutocomplete
            options={cities
              .map((el) => (el.name_heb || "").trim())
              .filter(Boolean)}
            value={eventData.city}
            onChange={(val) =>
              setEventData((prev) => ({
                ...prev,
                city: val,
                user_id: user.user_id,
              }))
            }
            className={classes.input}
            required
          />

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

          <label>Start Time</label>
          <HalfHourTimeSelect
            value={eventData.startTime}
            onChange={(val) =>
              setEventData((prev) => ({
                ...prev,
                startTime: val,
                user_id: user.user_id,
              }))
            }
            className={classes.input}
          />

          <label>Type of Event</label>
          <select name="type" onChange={handleChange} required>
            <option value="">-- Select Type --</option>
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>

          <label>
            Event Image (Optional)
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </label>

          <button type="submit">Create Event</button>
        </form>
      </main>
    </div>
  );
}
