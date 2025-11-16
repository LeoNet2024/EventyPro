// components/User10List/User10List.jsx
import React, { useEffect, useState } from "react";
import classes from "./User10List.module.css";

export default function User10List({ initialUsers = [] }) {
  const [users, setUsers] = useState(initialUsers);

  useEffect(() => setUsers(initialUsers), [initialUsers]);

  if (!users.length) return <p>No users found.</p>;

  return (
    <table className={classes.table}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Registered</th> {/* NEW */}
          <th>Blocked</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.user_id}>
            <td>{u.user_id}</td>
            <td>
              {u.first_name} {u.last_name}
            </td>
            <td>{u.email}</td>
            <td>
              {/* local date*/}
              {new Date(u.registration_date).toLocaleDateString()}
            </td>
            <td>{u.blocked ? "Yes" : "No"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
