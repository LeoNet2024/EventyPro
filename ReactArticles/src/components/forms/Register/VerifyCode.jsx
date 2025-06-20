// VerifyCode.jsx
// Verifies the code sent by email and creates the user in the DB

import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import classes from "./VerifyCode.module.css";

export default function VerifyCode() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await axios.post("/verification/confirm-verification", {
        code,
      });
      setMessage(res.data.message);
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      const msg = err.response?.data?.error || "Invalid code.";
      setError(msg);
    }
  };

  return (
    <div className={classes.container}>
      <h2>Enter Verification Code</h2>
      <form onSubmit={handleSubmit} className={classes.form}>
        {message && <p className={classes.success}>{message}</p>}
        {error && <p className={classes.error}>{error}</p>}

        <input
          type="text"
          placeholder="Enter code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className={classes.input}
          required
        />
        <button type="submit" className={classes.button}>
          Verify & Register
        </button>
      </form>
    </div>
  );
}
