import React, { useState } from "react";
import classes from "./edit.module.css";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";

export default function EditUser({ user, showForm, user_id }) {
  const { setUser } = useAuth();

  // use state for form
  const [formData, setFormData] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    user_name: user.user_name,
    user_id: user_id,
  });

  // update the form data
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      user_id: user_id,
    }));
  }

  // sending the form by put
  function handleSubmit(e) {
    e.preventDefault();

    axios
      // send obj
      .put("/personal-area/editProfile", formData)
      .then((res) => {
        showForm(false);
        setUser(res.data);
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

          {/* to do -> add cities */}

          <button type="submit">Save Changes</button>
          <button
            type="button"
            style={{ backgroundColor: "red" }}
            onClick={() => showForm(false)}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
