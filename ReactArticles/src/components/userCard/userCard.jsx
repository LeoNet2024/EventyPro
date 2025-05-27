import React, { useState } from "react";
import classes from "./userCard.module.css";
import { useAuth } from "../../context/AuthContext";
import Edit from "../../components/forms/edit/edit";

export default function UserView() {
  const { user } = useAuth();

  // used to display user edit form
  const [showEditUser, setShowEditUser] = useState(false);
  if (!user) {
    return <div className={classes.message}>Not logged in</div>;
  }

  return (
    <div className={classes.container}>
      <main className={classes.main}>
        <h2 className={classes.title}>User Details</h2>
        <div className={classes.card}>
          <p>
            <span>First Name:</span> {user.first_name}
          </p>
          <p>
            <span>Last Name:</span> {user.last_name}
          </p>
          <p>
            <span>Username:</span> {user.user_name}
          </p>
          <p>
            <span>Email:</span> {user.email}
          </p>
          <p>
            <span>City:</span> {user.city}
          </p>
          <p>
            <span>Gender:</span> {user.gender === "male" ? "Male" : "Female"}
          </p>
          <button onClick={() => setShowEditUser(true)}>
            Edit my detailes
          </button>
          {showEditUser && (
            <Edit
              user_id={user.user_id}
              user={user}
              showForm={setShowEditUser}
            />
          )}
        </div>
      </main>
    </div>
  );
}
