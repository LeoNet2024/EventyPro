import { useState } from "react";
import classes from "./Login.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

export default function Login() {
  // Accessing global auth context
  const { setUser } = useAuth();
  const navigate = useNavigate();

  // Local state for form inputs and error message
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  /**
   * Handles the login form submission:
   * - Sends credentials to the server
   * - Retrieves session info
   * - Navigates based on user role
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    axios
      .post("/login", { email, password }, { withCredentials: true })
      .then(() => {
        // Get session info after login success
        return axios.get("/login/session");
      })
      .then((res) => {
        // Save user in global context
        setUser(res.data);
        // Navigate based on role
        if (res.data.is_admin) navigate("/admin");
        else navigate("/home");
      })
      .catch((err) => {
        // Handle server-side or network errors
        if (err.response && err.response.data?.error) {
          setError(err.response.data.error);
        } else {
          setError("Login Error");
        }
      });
  };

  return (
    <div className={classes.loginContainer}>
      <h2>Login</h2>

      {/* Error message from server or fallback */}
      <form onSubmit={handleSubmit} className={classes.loginForm}>
        {error && <p className={classes.error}>{error}</p>}

        {/* Email input field */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={classes.input}
          required
        />

        {/* Password input field */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={classes.input}
          required
        />

        {/* Submit button */}
        <button type="submit" className={classes.button}>
          Login
        </button>

        <p className={classes.forgotPassword}>
          <span onClick={() => navigate("/forgot-password")}>
            forgot password?
          </span>
        </p>
      </form>

      {/* Test credentials for convenience */}
      <p>admin:</p>
      <p>admin@gmail.com</p>
      <p>admin123</p>
      <p>user:</p>
      <p>testtest@gmail.com</p>
      <p>testtest3</p>
    </div>
  );
}
