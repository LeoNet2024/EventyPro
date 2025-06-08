import React, { useEffect, useState } from "react";
import classes from "./userStats.module.css";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

export default function UserStats() {
  const { user } = useAuth();

  console.log(user);

  const [createdCount, setCreatedCount] = useState(0);
  const [joinedCount, setJoinedCount] = useState(0);
  const [lastComment, setLastComment] = useState("");

  useEffect(() => {
    if (user) {
      // Number of events that user created
      axios
        .post("personal-area/userStats/createdEvents", {
          user_id: user.user_id,
        })
        .then((res) => {
          setCreatedCount(res.data.count);
        })
        .catch((err) => console.error("Error createdEvents:", err));

      //Number of events that user joined them
      axios
        .post("personal-area/userStats/joinedEvents", { user_id: user.user_id })
        .then((res) => {
          setJoinedCount(res.data["join events"]);
        })
        .catch((err) => console.error("Error joinedEvents:", err));

      axios
        .post("personal-area/userStats/lastComment", { user_id: user.user_id })
        .then((res) => {
          console.log(res.data["comment_content"]);
          setLastComment(res.data["comment_content"]);
        })
        .catch((err) => console.error(err));
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className={classes.card}>
      <h3 className={classes.title}>User Statistics</h3>
      <ul className={classes.list}>
        <li>
          <span>Joined Events:</span> {joinedCount}
        </li>
        <li>
          <span>Created Events:</span> {createdCount}
        </li>
        <li>
          <span>Last Comment:</span> {lastComment}
        </li>
        <li>
          <span>Registered On:</span>{" "}
          {new Date(user.registration_date).toLocaleDateString()}
        </li>
      </ul>
    </div>
  );
}
