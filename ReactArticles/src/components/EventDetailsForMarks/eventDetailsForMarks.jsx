import React from "react";
import { Link } from "react-router-dom";
import classes from "./eventDetailsMarks.module.css";

export default function EventDetailsForMarks({ event, description, name }) {
  return (
    <div className={classes.container}>
      <h4 className={classes.title}>{"Name: " + name}</h4>
      <h4 className={classes.title}>{"City:" + event.description}</h4>
      <p className={classes.date}>
        {"Date: " + new Date(event.start_date).toLocaleDateString()}
      </p>
      <p className={classes.location}>{"Category: " + event.category}</p>
      <Link to={`/event/${event.event_id}`} className={classes.cardLink}>
        View details →
      </Link>
    </div>
  );
}
