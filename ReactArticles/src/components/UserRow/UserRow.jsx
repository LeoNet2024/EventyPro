// src/components/UserRow/UserRow.jsx
import classes from "./UserRow.module.css";

export default function UserRow({ user, onBlock, onDelete }) {
  return (
    <tr>
      <td>
        {user.first_name} {user.last_name}
      </td>
      <td>{user.user_name}</td>
      <td>{user.email}</td>
      <td>{user.blocked ? "Blocked" : "Active"}</td>
      <td>
        <button
          onClick={() => onBlock(user.user_id, user.blocked)}
          className={user.blocked ? classes.unblock : classes.block}
        >
          {user.blocked ? "Unblock" : "Block"}
        </button>
        <button
          onClick={() => onDelete(user.user_id)}
          className={classes.delete}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
