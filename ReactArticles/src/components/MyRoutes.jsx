import { Routes, Route } from "react-router-dom";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";
import Home from "../pages/Home/Home";
import classes from "./Page.module.css";
import LoginPage from "../pages/LoginPage/LoginPage";
import NewEvent from "./forms/newEvent/NewEvent";
import EventView from "./EventView/EventView";
import PersonalArea from "../pages/personalArea/personalArea";
import AdminDashboard from "../pages/AdminDashboard/AdminDashboard";
import ContactAdmin from "../pages/ContactAdmin/ContactAdmin";

export default function MyRoutes() {
  return (
    <>
      <Header />
      <main className={classes.page}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/personal-area" element={<PersonalArea />} />
          <Route path="/newEvent" element={<NewEvent />} />
          <Route path="/event/:id" element={<EventView />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/contact" element={<ContactAdmin />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
}
