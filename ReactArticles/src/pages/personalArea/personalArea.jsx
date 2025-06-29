import React, { useEffect, useState } from "react";
import classes from "./personalArea.module.css";
import axios from "axios";

import { useAuth } from "../../context/AuthContext";
import UserCard from "../../components/userCard/userCard";
import EventCard from "../../components/EventCard/EventCard";
import UserStats from "../../components/userStats/userStats";
import FriendRequests from "../../components/FriendRequests/FriendRequets";
import FriendsList from "../../components/myFriends/friendsList";

export default function PersonalArea() {
  const [resetRequests, setResetRequests] = useState(0);
  const { user } = useAuth();

  const [userEvents, setUserEvents] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);

  useEffect(() => {
    if (!user) return;

    axios
      .post("/personal-area", { user_id: user.user_id })
      .then((res) => {
        console.log(res.data);
        setUserEvents(res.data);
      })
      .catch((err) => console.error("Error loading events:", err));

    axios
      .post("/personal-area/FriendRequests", { user_id: user.user_id })
      .then((res) => setFriendRequests(res.data))
      .catch((err) => console.error("Error loading Friend Requests"));
  }, [user]);

  return (
    <div className={classes.container}>
      <header className={classes.header}>
        <h1>Personal Area</h1>
        <p>Welcome, {user?.first_name}</p>
      </header>

      <div className={classes.grid}>
        <div className={classes.leftPanel}>
          <UserCard />
          <UserStats noti={friendRequests.length} />
        </div>

        <div className={classes.rightPanel}>
          <FriendRequests
            requests={friendRequests}
            setResetRequests={setResetRequests}
          />
          <FriendsList user_id={user?.user_id} />
        </div>
      </div>

      <section className={classes.eventsSection}>
        <h2>My Events</h2>
        {userEvents.length > 0 ? (
          <div className={classes.eventGrid}>
            {userEvents.map((el) => (
              <EventCard key={el.event_id} event={el} />
            ))}
          </div>
        ) : (
          <p className={classes.noEvents}>No events to show</p>
        )}
      </section>
    </div>
  );
}
