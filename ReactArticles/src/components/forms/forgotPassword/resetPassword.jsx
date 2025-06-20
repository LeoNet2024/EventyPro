// ResetPassword.jsx
// Component for handling password reset using token from the URL

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import classes from "./resetPassword.module.css";

export default function ResetPassword() {
  const { token } = useParams(); // Get token from URL params
  const navigate = useNavigate();

  // Form fields and feedback messages
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /**
   * Handles form submission for resetting the password.
   * Validates the form and sends the new password to the backend.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    axios
      .post(`/verification/reset-password/${token}`, { password })
      .then(() => {
        setMessage("Password successfully reset! Redirecting to login...");
        setTimeout(() => navigate("/login"), 3000);
      })
      .catch((err) => {
        if (err.response?.data?.error) {
          setError(err.response.data.error);
        } else {
          setError("An error occurred while resetting the password");
        }
      });
  };

  /**
   * Renders the password reset form with input fields and feedback.
   */
  return (
    <div className={classes.container}>
      <h2>איפוס סיסמה</h2>
      <form onSubmit={handleSubmit} className={classes.form}>
        {message && <p className={classes.success}>{message}</p>}
        {error && <p className={classes.error}>{error}</p>}

        <input
          type="password"
          placeholder="סיסמה חדשה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="אישור סיסמה"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        <button type="submit">אפס סיסמה</button>
      </form>
    </div>
  );
}
