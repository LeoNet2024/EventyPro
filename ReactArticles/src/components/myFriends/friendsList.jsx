import React, { useEffect, useState } from "react";
import classes from "./friendsList.module.css";
import axios from "axios";

export default function FriendsList({ user_id }) {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    axios
      .post("/personal-area/myFriends", { user_id: user_id })
      .then((res) => {
        console.log(res.data);
        setFriends(res.data);
      })
      .catch((err) => console.error(err));
  }, [user_id]);

  if (!friends.length) {
    return <p className={classes.empty}>You have no friends yet 🥲</p>;
  }

  return (
    <div className={classes.wrapper}>
      <h2>Friends List</h2>
      <ul className={classes.list}>
        {friends.map((friend) => (
          <li key={friend.user_id} className={classes.card}>
            <img
              src={friend.src}
              alt={friend.user_name}
              className={classes.avatar}
            />
            <div className={classes.info}>
              <p className={classes.userName}>{friend.user_name}</p>
              <p className={classes.date}>
                Friends since:{" "}
                {new Date(friend.request_date).toLocaleDateString()}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
