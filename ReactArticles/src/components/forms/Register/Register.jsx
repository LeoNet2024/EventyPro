import { useEffect, useState } from "react";
import classes from "../login/Login.module.css";
import axios from "axios";
import VerifyCode from "../Register/VerifyCode"; // ודא שהנתיב נכון

export default function Register() {
  const [successMessage, setSuccessMessage] = useState("");
  const [cities, setCities] = useState([]);
  const [showVerification, setShowVerification] = useState(false);
  const [createdUserId, setCreatedUserId] = useState(null);

  useEffect(() => {
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
  }, []);

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
    if (!info.gender) newErrors.gender = "Gender is required.";
    if (!info.city) newErrors.city = "City is required.";
    if (!info.email) {
      newErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(info.email)) {
      newErrors.email = "Invalid email format.";
    }

    return newErrors;
  };

  const fetchData = () => {
    return axios
      .post("/register", info)
      .then((res) => {
        setSuccessMessage("Verification code sent to your email.");
        setCreatedUserId(res.data.user_id);
        setShowVerification(true);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      fetchData();
    }
  };

  if (showVerification) {
    return <VerifyCode userId={createdUserId} />;
  }

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
          Register
        </button>
      </form>
    </div>
  );
}
