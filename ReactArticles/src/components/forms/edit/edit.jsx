import React, { useState } from "react";
import classes from "./edit.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Edit({ user, cities, setShowEditUser, user_id }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    user_name: user.user_name,
    email: user.email,
    user_id: user_id,
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      user_id: user_id,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    axios
      // send obj
      .put("/personal-area/editProfile", formData)
      .then((res) => {
        console.log("User updated successfully:", res.data);
        setShowEditUser(false);
      })
      .catch((error) => {
        console.error("Update failed:", error);
        alert("Something went wrong while updating. Please try again.");
      });
  }

  return (
    <div className={classes.backdrop}>
      <div className={classes.modal}>
        <h2>Edit User</h2>
        <form className={classes.form} onSubmit={handleSubmit}>
          <label>
            First Name:
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
            />
          </label>

          <label>
            Last Name:
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
            />
          </label>

          <label>
            Username:
            <input
              type="text"
              name="user_name"
              value={formData.user_name}
              onChange={handleChange}
            />
          </label>

          <label>
            Password:
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </label>

          {/* to do -> add cities */}

          <label>
            Email:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </label>

          <button type="submit">Save Changes</button>
          <button
            type="button"
            style={{ backgroundColor: "red" }}
            onClick={() => setShowEditUser(false)}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
