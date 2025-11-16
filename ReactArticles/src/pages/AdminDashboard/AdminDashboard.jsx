// src/pages/AdminDashboard/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

import classes from "./AdminDashboard.module.css";
import UserList from "../../components/UserList/UserList";
import EventList from "../../components/EventList/EventList";
import AdminMessages from "../../components/AdminMessages/AdminMessages";
import User10List from "./User10List";
import Event10List from "./Event10List";
import Messages10List from "./Messages10List";
import TopActiveUsers from "../../components/TopActiveUsers/TopActiveUsers";
import TopEventCreators from "../../components/TopEventCreators/TopEventCreators";
import TopEventCities from "../../components/TopEventCities/TopEventCities";

axios.defaults.withCredentials = true;

export default function AdminDashboard() {
  const [view, setView] = useState("users");
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [messages, setMessages] = useState([]);

  // bring the most new
  useEffect(() => {
    axios
      .get("/admin/summary")
      .then(({ data }) => {
        setUsers(data.users);
        setEvents(data.events);
        setMessages(data.messages);
      })
      .catch((err) => console.error("Dashboard load error:", err));
  }, []);

  return (
    <div className={classes.dashboard}>
      <h2 className={classes.dashboardTitle}>Admin Dashboard</h2>

      <section style={{ marginBottom: 16 }}>
        <TopActiveUsers />
      </section>

      <section style={{ marginBottom: 16 }}>
        <TopEventCreators />
      </section>

      <section style={{ marginBottom: 16 }}>
        <TopEventCities />
      </section>

      <div className={classes.overview}>
        <section className={classes.card}>
          <h3 className={classes.cardTitle}>Recently created events</h3>
          <Event10List initialEvents={events} />
        </section>

        <section className={classes.card}>
          <h3 className={classes.cardTitle}>Recent messages</h3>
          <Messages10List initialMessages={messages} />
        </section>

        <section className={classes.card}>
          <h3 className={classes.cardTitle}>Recently registered users</h3>
          <User10List initialUsers={users} />
        </section>
      </div>

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
        {view === "users" && <UserList initialUsers={users} />}
        {view === "events" && <EventList initialEvents={events} />}
        {view === "messages" && <AdminMessages initialMessages={messages} />}
      </main>
    </div>
  );
}
