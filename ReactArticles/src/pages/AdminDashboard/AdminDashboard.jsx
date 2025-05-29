import classes from "./AdminDashboard.module.css";
import { useState } from "react";
import UserList from "../../components/UserList/UserList";
import EventList from "../../components/EventList/EventList";

export default function AdminDashboard() {
  const [view, setView] = useState("users");

  return (
    <div className={classes.dashboard}>
      <h2 className={classes.dashboardTitle}>Admin Dashboard</h2>
      <aside className={classes.sidebar}>
        <button
          className={view === "users" ? classes.active : ""}
          onClick={() => setView("users")}
        >
          Manage Users
        </button>
        <button
          className={view === "events" ? classes.active : ""}
          onClick={() => setView("events")}
        >
          Manage Events
        </button>
        <button
          className={view === "messages" ? classes.active : ""}
          onClick={() => setView("messages")}
        >
          Messages
        </button>
      </aside>

      <main className={classes.main}>
        {view === "users" && <UserList />}
        {view === "events" && <EventList />}
        {/*view === "messages" && <AdminMessages />} */}
      </main>
    </div>
  );
}
