// components/Messages10List/Messages10List.jsx
import React, { useEffect, useState } from "react";
import classes from "./Messages10List.module.css";

export default function Messages10List({ initialMessages = [] }) {
  const [messages, setMessages] = useState(initialMessages);
  useEffect(() => setMessages(initialMessages), [initialMessages]);

  if (!messages.length) return <p>No admin messages.</p>;

  return (
    <div className={classes.grid}>
      {messages.map((m) => (
        <div key={m.message_id} className={classes.card}>
          <h4>{m.subject}</h4>
          <p>{m.message}</p>
          <small>
            {new Date(m.created_at).toLocaleString()} •{" "}
            {m.answered ? "Answered" : "Pending"}
          </small>
        </div>
      ))}
    </div>
  );
}
