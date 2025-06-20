// ForgotPassword.jsx
// Component for handling password reset via email

import { useState } from "react";
import axios from "axios";
import classes from "./forgotPassword.module.css";

export default function ForgotPassword() {
  // State for email input, success message, and error message
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /**
   * Handles the form submission for sending a password reset request.
   * Sends a POST request to the backend with the user's email.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    axios
      .post("/verification/forgot-password", { email })
      .then((res) => {
        setMessage(
          res.data.message || "Password reset link was sent to your email"
        );
      })
      .catch((err) => {
        if (err.response?.data?.error) {
          setError(err.response.data.error);
        } else {
          setError("An error occurred while sending the request");
        }
      });
  };

  /**
   * Renders the password reset form.
   */
  return (
    <div className={classes.container}>
      <h2>שחזור סיסמה</h2>
      <form onSubmit={handleSubmit} className={classes.form}>
        {message && <p className={classes.success}>{message}</p>}
        {error && <p className={classes.error}>{error}</p>}

        <input
          type="email"
          placeholder="הכנס את כתובת המייל שלך"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={classes.input}
        />

        <button type="submit" className={classes.button}>
          שלח קישור לאיפוס
        </button>
      </form>
    </div>
  );
}
