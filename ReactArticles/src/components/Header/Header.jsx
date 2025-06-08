import { useAuth } from "../../context/AuthContext";
import classes from "./Header.module.css";
import NavBar from "../NavBar/NavBar";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  function handleLogoClick() {
    navigate("/home");
  }
  return (
    <header className={classes.header}>
      <div className={classes.headerContainer}>
        <div className={classes.logo} onClick={handleLogoClick}>
          Eventy
        </div>
        <div className={classes.nav}>
          <NavBar setUser={setUser} />
        </div>
      </div>
      <div>{user && <p>Welcome, {user.first_name}</p>}</div>
      {user && Boolean(user?.is_admin) && <p>Logged in as admin</p>}
    </header>
  );
}
