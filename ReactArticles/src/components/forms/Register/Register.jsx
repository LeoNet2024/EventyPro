// Register.jsx
// Sends verification code to user's email, but does NOT create the user yet

import { useMemo, useCallback, useState, useEffect } from "react";
import axios from "axios";
import classes from "../login/Login.module.css";
import VerifyCode from "../Register/VerifyCode";
import CityAutocomplete from "../newEvent/CityAutocomplete";

export default function Register() {
  const [successMessage, setSuccessMessage] = useState("");
  const [cities, setCities] = useState([]);
  const [showVerification, setShowVerification] = useState(false);
  const [info, setInfo] = useState({
    first_name: "",
    last_name: "",
    user_name: "",
    password: "",
    gender: "",
    city: "",
    email: "",
  });
  const [errors, setErrors] = useState({});

  // Lower case
  const norm = (s) => (s || "").trim().toLowerCase();

  // clean list of cities
  const cityOptions = useMemo(
    () => cities.map((c) => (c.name_heb || "").trim()).filter(Boolean),
    [cities]
  );

  // check if the city exists
  const cityExists = useCallback(
    (name) => cityOptions.some((o) => norm(o) === norm(name)),
    [cityOptions]
  );

  // Fetch cities for dropdown
  useEffect(() => {
    axios.get("/register/cities").then((res) => {
      const valid = res.data.filter((c) => c.name_heb?.trim().length > 0);
      setCities(valid);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInfo((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!/^[A-Za-z]{2,}$/.test(info.first_name))
      newErrors.first_name = "First name must contain at least 2 letters.";
    if (!/^[A-Za-z]{2,}$/.test(info.last_name))
      newErrors.last_name = "Last name must contain at least 2 letters.";
    if (!info.user_name.trim()) newErrors.user_name = "Username is required.";
    if (
      !info.password ||
      info.password.length < 3 ||
      info.password.length > 8 ||
      !/\d/.test(info.password) ||
      !/[a-zA-Z]/.test(info.password)
    ) {
      newErrors.password =
        "Password must be 3–8 characters and include at least one letter and one number.";
    }
    if (!info.gender) newErrors.gender = "Gender is required.";
    if (!info.city) newErrors.city = "City is required.";
    if (!info.email || !/^\S+@\S+\.\S+$/.test(info.email)) {
      newErrors.email = "Valid email is required.";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const res = await axios.post("/register/request-verification", info);
      setSuccessMessage(res.data.message);
      setShowVerification(true);
    } catch (err) {
      const msg = err.response?.data?.error || "Unexpected error.";
      setErrors({ email: msg });
    }
  };

  if (showVerification) return <VerifyCode />;

  return (
    <div className={classes.loginContainer}>
      <h2>Register</h2>
      {successMessage && (
        <div className={classes.success}>{successMessage}</div>
      )}

      <form onSubmit={handleSubmit} className={classes.loginForm}>
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

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={info.password}
          onChange={handleChange}
          className={classes.input}
        />
        {errors.password && <p className={classes.error}>{errors.password}</p>}

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

        <CityAutocomplete
          options={cityOptions}
          value={info.city}
          onChange={(val) => {
            setInfo((prev) => ({ ...prev, city: val }));
            setErrors((prev) => ({ ...prev, city: "" }));
          }}
          className={classes.input}
          required
        />
        {errors.city && <p className={classes.error}>{errors.city}</p>}

        {errors.city && <p className={classes.error}>{errors.city}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={info.email}
          onChange={handleChange}
          className={classes.input}
        />
        {errors.email && <p className={classes.error}>{errors.email}</p>}

        <button type="submit" className={classes.button}>
          Send Verification Code
        </button>
      </form>
    </div>
  );
}
