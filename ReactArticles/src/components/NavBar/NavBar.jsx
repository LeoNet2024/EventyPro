import { useAuth } from "../../context/AuthContext";
import { NavLink } from "react-router-dom";
import classes from "./NavBar.module.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function NavBar() {
  const { user, setUser } = useAuth();

  const navigate = useNavigate();

  // logout from page and remove the session
  const handleLogout = () => {
    axios
      .post("/logout", {}, { withCredentials: true })
      .then(() => {
        navigate("/home");
        setUser(null); 
      })
      .catch((err) => {
        console.error("Logout failed:", err);
      });
  };

  return (
    <nav className={classes.navbar}>
      <NavLink
        to="/"
        className={({ isActive }) => (isActive ? classes.active : "")}
      >
        Home
      </NavLink>
      {user && (
        <NavLink
          to="/personal-area"
          className={({ isActive }) => (isActive ? classes.active : "")}
        >
          Personal Area
        </NavLink>
      )}
      {user && (
        <NavLink
          to="/chatWithFriends"
          className={({ isActive }) => (isActive ? classes.active : "")}
        >
          Chat
        </NavLink>
      )}
      {user ? (
        <button onClick={handleLogout} className={classes.logoutButton}>
          Logout
        </button>
      ) : (
        <NavLink
          to="/login"
          className={({ isActive }) => (isActive ? classes.active : "")}
        >
          Login
        </NavLink>
      )}
      {user && (
        <NavLink
          to="/newEvent"
          className={({ isActive }) => (isActive ? classes.active : "")}
        >
          New Event
        </NavLink>
      )}

      {user && Boolean(user?.is_admin) && (
        <NavLink
          to="/admin"
          className={({ isActive }) => (isActive ? classes.active : "")}
        >
          Dashboard
        </NavLink>
      )}

      {user && Boolean(!user?.is_admin) && (
        <NavLink
          to="/contact"
          className={({ isActive }) => (isActive ? classes.active : "")}
        >
          Contact Us
        </NavLink>
      )}
    </nav>
  );
}
