import { useEffect, useState } from "react";
import classes from "../login/Login.module.css"; // shared styling
import axios from "axios";

export default function Register() {
  // State to hold success message after registration
  const [successMessage, setSuccessMessage] = useState("");

  // State to hold list of cities loaded from backend
  const [cities, setCities] = useState([]);

  /**
   * Load list of cities from backend on component mount.
   * Used in <select> list for city options.
   */
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

  /**
   * Sends the registration data to the backend.
   * Handles success and server-side validation errors.
   */
  const fetchData = () => {
    return axios
      .post("/login/register", info)
      .then((res) => {
        const name = info.first_name;
        setSuccessMessage(`${name} has been registered successfully!`);
        return true;
      })
      .catch((error) => {
        if (
          error.response &&
          error.response.status === 400 &&
          error.response.data.error === "Email already exists."
        ) {
          setErrors((prev) => ({ ...prev, email: "Email already exists." }));
        } else {
          console.error("Unexpected error:", error);
        }
        return false;
      });
  };

  // Form information from user input
  const [info, setInfo] = useState({
    first_name: "",
    last_name: "",
    user_name: "",
    password: "",
    gender: "",
    city: "",
    email: "",
  });

  // State for field-specific error messages
  const [errors, setErrors] = useState({});

  /**
   * Updates form field values and clears related error messages
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  /**
   * Validates all form fields before submission.
   * Returns an object with any errors found.
   */
  const validate = () => {
    const newErrors = {};

    // First/last name: only letters, min 2 chars
    if (!/^[A-Za-z]{2,}$/.test(info.first_name)) {
      newErrors.first_name = "First name must contain at least 2 letters.";
    }
    if (!/^[A-Za-z]{2,}$/.test(info.last_name)) {
      newErrors.last_name = "Last name must contain at least 2 letters.";
    }

    // Username required
    if (!info.user_name.trim()) {
      newErrors.user_name = "Username is required.";
    }

    // Password rules: 3–8 chars, at least one digit and one letter
    if (!info.password) {
      newErrors.password = "Password is required.";
    } else if (
      info.password.length < 3 ||
      info.password.length > 8 ||
      !/\d/.test(info.password) ||
      !/[a-zA-Z]/.test(info.password)
    ) {
      newErrors.password =
        "Password must be 3–8 characters and include at least one letter and one number.";
    }

    // Gender and city are required selections
    if (!info.gender) newErrors.gender = "Gender is required.";
    if (!info.city) newErrors.city = "City is required.";

    // Email format validation
    if (!info.email) {
      newErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(info.email)) {
      newErrors.email = "Invalid email format.";
    }

    return newErrors;
  };

  /**
   * Handles form submission:
   * - Validates all fields
   * - Sends data to server
   * - Displays success or error messages
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      fetchData().then(() => {
        // Reset form after success
        setInfo({
          first_name: "",
          last_name: "",
          user_name: "",
          password: "",
          gender: "",
          city: "",
          email: "",
        });
      });
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  };

  // ----------------- RENDER -----------------

  return (
    <div className={classes.loginContainer}>
      <h2>Register</h2>

      {/* Displaying success message after successful registration */}
      {successMessage && (
        <div className={classes.success}>{successMessage}</div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className={classes.loginForm}>
        {/* First Name */}
        <div>
          <input
            type="text"
            name="first_name"
            placeholder="First Name"
            value={info.first_name}
            onChange={handleChange}
            className={classes.input}
          />
          {errors.first_name && (
            <p className={classes.error}>{errors.first_name}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <input
            type="text"
            name="last_name"
            placeholder="Last Name"
            value={info.last_name}
            onChange={handleChange}
            className={classes.input}
          />
          {errors.last_name && (
            <p className={classes.error}>{errors.last_name}</p>
          )}
        </div>

        {/* Username */}
        <div>
          <input
            type="text"
            name="user_name"
            placeholder="Username"
            value={info.user_name}
            onChange={handleChange}
            className={classes.input}
          />
          {errors.user_name && (
            <p className={classes.error}>{errors.user_name}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={info.password}
            onChange={handleChange}
            className={classes.input}
          />
          {errors.password && (
            <p className={classes.error}>{errors.password}</p>
          )}
        </div>

        {/* Gender selection */}
        <div>
          <select
            name="gender"
            value={info.gender}
            onChange={handleChange}
            className={classes.input}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          {errors.gender && <p className={classes.error}>{errors.gender}</p>}
        </div>

        {/* City selection */}
        <div>
          <select
            name="city"
            value={info.city}
            onChange={handleChange}
            className={classes.input}
          >
            <option value="">Select City</option>
            {cities.map((el, idx) => {
              const name = el.name_heb.trim();
              const formattedName =
                name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
              return (
                <option key={idx} value={formattedName}>
                  {formattedName}
                </option>
              );
            })}
          </select>
          {errors.city && <p className={classes.error}>{errors.city}</p>}
        </div>

        {/* Email */}
        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={info.email}
            onChange={handleChange}
            className={classes.input}
          />
          {errors.email && <p className={classes.error}>{errors.email}</p>}
        </div>

        {/* Submit Button */}
        <button type="submit" className={classes.button}>
          Register
        </button>
      </form>
    </div>
  );
}
