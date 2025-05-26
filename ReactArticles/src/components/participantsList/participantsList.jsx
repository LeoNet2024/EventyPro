import React from 'react';
import classes from './participantsList.module.css';

export default function ParticipantsList({ participants }) {
  if (!participants || participants.length === 0) {
    return <p className={classes.empty}>No participants yet.</p>;
  }

  return (
    <div className={classes.participantList}>
      <h3 className={classes.title}>Participants</h3>
      <ul className={classes.list}>
        {participants.map((participant, index) => (
          <li key={participant.user_id} className={classes.item}>
            <span className={classes.index}>{index + 1}</span>
            <img
              src={participant.src}
              alt={participant.user_name}
              className={classes.avatar}
            />
            <span className={classes.name}>{participant.user_name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
