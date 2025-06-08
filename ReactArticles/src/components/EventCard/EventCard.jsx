import { Link } from "react-router-dom";
import classes from "./EventCard.module.css";

export default function EventCard({ event }) {
  return (
    <Link to={`/event/${event.event_id}`} className={classes.cardLink}>
      <div className={classes.eventCard}>
        <img src={event.src} alt={event.event_name} className={classes.image} />
        <div className={classes.content}>
          <h2 className={classes.title}>{event.event_name}</h2>
          <p className={classes.category}>{event.category}</p>
          <span className={classes.viewMore}>View Details →</span>
        </div>
      </div>
    </Link>
  );
}
