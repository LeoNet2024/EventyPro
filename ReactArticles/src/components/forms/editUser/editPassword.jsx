import React, { useState } from "react";
import axios from "axios";
import classes from "./edit.module.css"; // You can adjust this path as needed

export default function EditPassword({ user_id, showForm }) {
  const [PassNotMatch, setPassNotMatch] = useState(false);

  // used to edit msg error
  const [errMsg, setErrMsg] = useState("");

  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  // user fiiling the form
  function handleChange(e) {
    // when user edit the form, message should not appears
    setPassNotMatch(false);
    setErrMsg("");
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // send form to DB
  function handleSubmit(e) {
    e.preventDefault();

    if (formData.new_password !== formData.confirm_password) {
      setPassNotMatch(() => true);
      setErrMsg("password doesnt match");
      return;
    }

    axios
      .put("/personal-area/editProfile/editPassword", {
        user_id,
        old_password: formData.old_password,
        new_password: formData.new_password,
      })
      .then((res) => {
        alert("Password updated successfully!");
        showForm(false);
      })
      .catch((err) => {
        console.error(err);
        setErrMsg("Wrong current password.");
        alert("Failed to update password.");
      });
  }

  return (
    <div className={classes.backdrop}>
      <div className={classes.modal}>
        <h2>Change Password</h2>
        <form className={classes.form} onSubmit={handleSubmit}>
          <label>
            Old Password:
            <input
              type="password"
              name="old_password"
              value={formData.old_password}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            New Password:
            <input
              type="password"
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Confirm New Password:
            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
            />
          </label>

          <button type="submit">Update Password</button>
          <button
            type="button"
            style={{ backgroundColor: "red" }}
            onClick={() => showForm(false)}
          >
            Cancel
          </button>
          {PassNotMatch && <p>{errMsg}</p>}
        </form>
      </div>
    </div>
  );
}
