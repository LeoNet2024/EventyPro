import React, { useState } from "react";
import classes from "./FriendRequest.module.css";
import axios from "axios";

export default function FriendRequests({ requests }) {
  // This fucntion handling with user respone to request.
  // got the parameters from onClickEvent
  function handleToRequest(userRespone, request_id) {
    //Make sure only 2 options will pass the test
    if (userRespone !== "confirm" && userRespone !== "ignore") return;

    axios
      .put("/personal-area/FriendRequests/responeToRequest", {
        user_respone: userRespone,
        request_id: request_id,
      })
      .then((res) => {
        console.log(`The respone is : ${userRespone}`);
      })
      .catch((err) => console.error(err));
  }

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
              <button
                className={classes.confirm}
                onClick={() => handleToRequest("confirm", req.request_id)}
              >
                Confirm
              </button>
              <button
                className={classes.ignore}
                onClick={() => handleToRequest("ignore", req.request_id)}
              >
                Ignore
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
