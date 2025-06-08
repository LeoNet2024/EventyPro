import React, { useEffect, useState } from "react";
import classes from "./personalArea.module.css";

import { useAuth } from "../../context/AuthContext";
import UserView from "../../components/userCard/userCard";
import EventCard from "../../components/EventCard/EventCard";
import UserStats from "../../components/userStats/userStats";
import axios from "axios";
import FriendRequests from "../../components/FriendRequests/FriendRequets";

export default function PersonalArea() {
  const { user } = useAuth();

  //User Events
  const [userEvents, setUserEvents] = useState([]);

  // Friend Requests
  const [friendRequests, setFriendRequests] = useState([]);

  useEffect(() => {
    if (!user) return;
    axios

      // Get Events from DB
      .post("/personal-area", { user_id: user.user_id })
      .then((res) => {
        setUserEvents(res.data);
      })
      .catch((err) => {
        console.error("Error loading events:", err);
      });

    // Getting friends requests from DB
    axios
      .post("/personal-area/FriendRequests", { user_id: user.user_id })
      .then((res) => {
        setFriendRequests(res.data);
      })
      .catch((err) => console.error("Error loading Friend Requests"));
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
        <p>Welcome, {user?.first_name}</p>
      </header>
      <FriendRequests requests={friendRequests} />

      <section className={classes.eventsSection}>
        <h2>My Events </h2>
        {eventsToShow}
      </section>
      <section className={classes.userSection}>
        <UserView />
      </section>
      <h2>Statistics</h2>
      {/* to do */}
      <UserStats noti={friendRequests.length} />
      <h2> My friends </h2>
    </div>
  );
}
