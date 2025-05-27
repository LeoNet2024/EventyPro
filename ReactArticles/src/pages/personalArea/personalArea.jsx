import React, { useEffect, useState } from "react";
import classes from "./personalArea.module.css";

import { useAuth } from "../../context/AuthContext";
import UserView from "../../components/userCard/userCard";
import EventCard from "../../components/EventCard/EventCard";
import axios from "axios";

export default function PersonalArea() {
  const { user } = useAuth();
  const [userEvents, setUserEvents] = useState([]);

  useEffect(() => {
    if (!user) return;
    axios
      .post("/personal-area", { user_id: user.user_id })
      .then((res) => {
        setUserEvents(res.data);
        console.log("Events loaded:", res.data);
      })
      .catch((err) => {
        console.error("Error loading events:", err);
      });
  }, [user]);

  // Showcasing the events of the current user, if there are any
  const eventsToShow =
    userEvents.length > 0 ? (
      <div className={classes.eventGrid}>
        {userEvents.map((el) => {
          return <EventCard key={el.event_id} event={el} />;
        })}
      </div>
    ) : (
      <p className={classes.noEvents}>No events to Show</p>
    );

  return (
    <div className={classes.container}>
      <header className={classes.header}>
        <h1>Personal Area</h1>
        <p>Welcome, {user?.first_name} 👋</p>
      </header>
      <h2>My Events </h2>
      {eventsToShow}
      <section className={classes.userSection}>
        <UserView />
      </section>
      <section className={classes.eventsSection}></section>
    </div>
  );
}
