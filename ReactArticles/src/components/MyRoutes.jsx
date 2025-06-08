import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";
import Home from "../pages/Home/Home";
import LoginPage from "../pages/LoginPage/LoginPage";
import PersonalArea from "../pages/personalArea/personalArea";
import NewEvent from "./forms/newEvent/NewEvent";
import EventView from "./EventView/EventView";
import AdminDashboard from "../pages/AdminDashboard/AdminDashboard";
import ContactAdmin from "../pages/ContactAdmin/ContactAdmin";
import classes from "./Page.module.css";

export default function MyRoutes() {
  const { user } = useAuth();

  // Simple protection: redirects to /login if not logged in
  const RequireAuth = (element) => {
    return user ? element : <Navigate to="/login" replace />;
  };

  // Optional: only allow admins to enter /admin
  const RequireAdmin = (element) => {
    return user && user.is_admin ? element : <Navigate to="/login" replace />;
  };

  return (
    <>
      <Header />
      <main className={classes.page}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route
            path="/personal-area"
            element={RequireAuth(<PersonalArea />)}
          />
          <Route path="/newEvent" element={RequireAuth(<NewEvent />)} />
          <Route path="/event/:id" element={RequireAuth(<EventView />)} />
          <Route path="/contact" element={RequireAuth(<ContactAdmin />)} />

          {/* Admin-only route */}
          <Route path="/admin" element={RequireAdmin(<AdminDashboard />)} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
