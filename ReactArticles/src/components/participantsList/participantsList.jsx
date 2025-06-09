import React, { useState } from "react";
import classes from "./participantsList.module.css";
import { useAuth } from "../../context/AuthContext";
import Participant from "../participant/participants";
import { IoPersonAddOutline } from "react-icons/io5";

// This component just maps the participants and renders a Participant for each one
export default function ParticipantsList({ participants, maxParticipants }) {
  const { user } = useAuth();

  if (!participants || participants.length === 0) {
    return <p className={classes.empty}>No participants yet.</p>;
  }

  return (
    <div className={classes.participantList}>
      <h3 className={classes.title}>
        משתתפים: {participants.length}/{maxParticipants}
      </h3>

      <ul className={classes.list}>
        {participants.map((participant, index) => (
          <li key={participant.user_id} className={classes.item}>
            <Participant
              participant={participant}
              index={index}
              active_user={user.user_id}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
