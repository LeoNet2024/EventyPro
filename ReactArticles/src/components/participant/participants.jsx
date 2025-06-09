import React, { useState } from "react";
import classes from "./participants.module.css";
import { IoPersonAddOutline } from "react-icons/io5";
import axios from "axios";

// Displays a full participant card with all details and a "Add Friend" button
export default function Participant({ participant, index, active_user }) {
  const [message, setMessage] = useState("");
  const [requestSent, setRequestSent] = useState(false);

  const isNotSelfOrAdmin =
    participant.is_admin !== 1 && active_user !== participant.user_id;

  function handleRequest() {
    axios
      .post("/event/sendFriendRequest", {
        sender_id: active_user, // sender is the logged-in user
        receiver_id: participant.user_id, // receiver is the participant
      })
      .then((res) => {
        setRequestSent(true); // Hide button after sending
        setMessage("Friend request sent");
      })
      .catch((err) => {
        if (err.response?.status === 403) {
          setMessage("Friend request already sent");
          setRequestSent(true);
        } else {
          setMessage("Error sending request");
          console.error(err);
        }
      });
  }

  return (
    <div className={classes.card}>
      <span className={classes.index}>{index + 1}</span>

      <img
        className={classes.avatar}
        src={participant.src}
        alt={`${participant.first_name} ${participant.last_name}`}
      />

      <div className={classes.info}>
        <p className={classes.userName}>
          {participant.user_name}
          {participant.is_admin === 1 && (
            <span className={classes.adminTag}> (Admin)</span>
          )}
        </p>
        <p>
          <strong>First Name:</strong> {participant.first_name}
        </p>
        <p>
          <strong>Last Name:</strong> {participant.last_name}
        </p>
        <p>
          <strong>User Name:</strong> {participant.user_name}
        </p>
      </div>

      {isNotSelfOrAdmin && !requestSent && (
        <button className={classes.addButton} onClick={handleRequest}>
          <IoPersonAddOutline /> Add Friend
        </button>
      )}

      {message && <p className={classes.message}>{message}</p>}
    </div>
  );
}
