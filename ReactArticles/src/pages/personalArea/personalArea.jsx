import React, { useEffect, useMemo, useState } from "react";
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

  // טוען אירועים של המשתמש (אותו payload כמו קודם)
  useEffect(() => {
    if (!user) return;
    axios
      .post("/personal-area", { user_id: user.user_id })
      .then((res) => setUserEvents(res.data))
      .catch((err) => console.error("Error loading events:", err));
  }, [user]);

  // טוען בקשות חברות (תלוי ב-resetRequests כדי לרענן אחרי פעולה)
  useEffect(() => {
    if (!user) return;
    axios
      .post("/personal-area/FriendRequests", { user_id: user.user_id })
      .then((res) => setFriendRequests(res.data))
      .catch((err) => console.error("Error loading Friend Requests"));
  }, [user, resetRequests]);

  // My Events = אירועים שנוצרו על ידי המשתמש הנוכחי
  const myEvents = useMemo(() => {
    if (!user) return [];
    return (userEvents || []).filter(
      (e) => Number(e.created_by) === Number(user.user_id)
    );
  }, [userEvents, user]);

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

      {/* --- My Events: רק אירועים שהמשתמש יצר --- */}
      <section className={classes.eventsSection}>
        <h2>My Events</h2>
        {myEvents.length > 0 ? (
          <div className={classes.eventGrid}>
            {myEvents.map((el) => (
              <EventCard key={el.event_id} event={el} />
            ))}
          </div>
        ) : (
          <p className={classes.noEvents}>
            You have not created any events yet
          </p>
        )}
      </section>

      {/* --- All events (מה שחזר מה־API שלך) --- */}
      <section className={classes.eventsSection}>
        <h2>All events</h2>
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
