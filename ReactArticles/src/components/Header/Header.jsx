import { useAuth } from "../../context/AuthContext";
import classes from "./Header.module.css";
import NavBar from "../NavBar/NavBar";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const handleLogoClick = () => navigate("/home");

  return (
    <>
      {/* Skip link for accessibility */}
      <a href="#main" className={classes.skipLink}>
        Skip to content
      </a>

      <header className={classes.header} role="banner">
        <div className={classes.inner}>
          {/* Left: Logo */}
          <button
            type="button"
            onClick={handleLogoClick}
            className={classes.logoBtn}
            aria-label="Go to home"
          >
            <span className={classes.logoAccent}>Eventy</span>
            <br />
            <span className={classes.logoAccent} style={{ fontSize: "1rem" }}>
              Go Out. Meet More.
            </span>
          </button>

          {/* Center: Nav */}
          <nav className={classes.nav} aria-label="Primary">
            <NavBar setUser={setUser} />
          </nav>

          {/* Right: User info (optional) */}
          <div className={classes.rightSlot}>
            {user && (
              <div className={classes.userStrip} aria-live="polite">
                <span className={classes.welcome}>
                  Hello, {user.first_name}
                </span>
                {Boolean(user?.is_admin) && (
                  <span className={classes.rolePill} title="Admin">
                    Admin
                  </span>
                )}
                <img className={classes.profilePic} src={user.src} alt="" />
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
