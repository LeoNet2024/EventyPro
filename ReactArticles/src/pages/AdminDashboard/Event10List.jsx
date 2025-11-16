// components/Event10List/Event10List.jsx
import React, { useEffect, useState } from "react";
import classes from "./Event10List.module.css";

export default function Event10List({ initialEvents = [] }) {
  const [events, setEvents] = useState(initialEvents);
  useEffect(() => setEvents(initialEvents), [initialEvents]);

  if (!events.length) return <p>No events found.</p>;

  return (
    <table className={classes.table}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Event Creator</th>
          <th>Category</th>
          <th>City</th>
          <th>Date</th>
          <th>Participants</th>
        </tr>
      </thead>
      <tbody>
        {events.map((e) => (
          <tr key={e.event_id}>
            <td>{e.event_id}</td>
            <td>{e.event_name}</td>
            <td>{e.category}</td>
            <td>{e.city}</td>
            <td>{new Date(e.start_date).toLocaleDateString()}</td>
            <td>
              {e.actual_participants}/{e.participant_amount}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
