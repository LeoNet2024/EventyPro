import React, { useState } from "react";
import classes from "./participantsList.module.css";
import { useAuth } from "../../context/AuthContext";
import Participant from "../participant/participants";
import { IoPersonAddOutline } from "react-icons/io5";
import axios from "axios";
import removeLogo from "../../assets/img/delete.png";

// This component just maps the participants and renders a Participant for each one
export default function ParticipantsList({
  participants,
  maxParticipants,
  event_id,
  setSuccessMsg,
  isOwner,
  fetchData,
}) {
  const { user } = useAuth();

  if (!participants || participants.length === 0) {
    return <p className={classes.empty}>No participants yet.</p>;
  }

  function removeUser(event_id, uid) {
    axios
      .post(`/event//events/${event_id}/requests/${uid}/reject`, {
        eventId: event_id,
        userId: uid,
      })
      .then(() => {
        setSuccessMsg("User removed successfully.");
        fetchData(); // Updating the participants in real time
      })
      .catch((error) => {
        console.error("Error removing user:", error);
      });
  }

  return (
    <div className={classes.participantList}>
      <h3 className={classes.title}>
        participants: {participants.length}/{maxParticipants}
      </h3>

      <ul className={classes.list}>
        {participants.map((participant, index) => (
          <li key={participant.user_id} className={classes.item}>
            <Participant
              participant={participant}
              index={index}
              active_user={user.user_id}
            />
            {isOwner && participant.user_id !== user.user_id && (
              <button
                onClick={() => removeUser(event_id, participant.user_id)}
                className={classes.removeBtn}
              >
                <img src={removeLogo} className={classes.removeLogo} />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
