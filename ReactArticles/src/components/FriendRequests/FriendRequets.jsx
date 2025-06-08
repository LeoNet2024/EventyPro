import React from "react";
import classes from "./FriendRequest.module.css";

export default function FriendRequests({ requests, onConfirm, onIgnore }) {
  return (
    <div className={classes.wrapper}>
      <h2>Friend Requests</h2>
      {requests.length === 0 ? (
        <p>No friend requests</p>
      ) : (
        requests.map((req) => (
          <div key={req.request_id} className={classes.requestCard}>
            <span>{req.user_name}</span>
            <div className={classes.actions}>
              <button className={classes.confirm}>Confirm</button>
              <button className={classes.ignore}>Ignore</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
