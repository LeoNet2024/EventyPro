import React, { useState } from "react";
import classes from "./userCard.module.css";
import { useAuth } from "../../context/AuthContext";
import Edit from "../forms/editUser/editUser";
import EditPassword from "../forms/editUser/editPassword";

export default function UserCard() {
  const { user } = useAuth();
  const [showEditUser, setShowEditUser] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  if (!user) {
    return <div className={classes.message}>Not logged in</div>;
  }

  return (
    <div className={classes.card}>
      <div className={classes.left}>
        <img
          className={classes.avatar}
          src={user.src || "/images/default-avatar.jpg"}
          alt={user.user_name}
        />
        <div className={classes.buttons}>
          <button onClick={() => setShowEditUser(true)}>Edit Details</button>
          <button onClick={() => setShowEditPassword(true)}>
            Change Password
          </button>
        </div>
      </div>

      <div className={classes.right}>
        <h2>
          {user.first_name} {user.last_name}
        </h2>
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
      </div>

      {showEditUser && (
        <Edit user_id={user.user_id} user={user} showForm={setShowEditUser} />
      )}
      {showEditPassword && (
        <EditPassword user_id={user.user_id} showForm={setShowEditPassword} />
      )}
    </div>
  );
}
