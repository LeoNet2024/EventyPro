import { Link } from "react-router-dom";
import classes from "./EventCard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";

export default function EventCard({ event }) {
  return (
    <Link to={`/event/${event.event_id}`} className={classes.cardLink}>
      <div className={classes.eventCard}>
        <div className={classes.leftBorder}></div>

        {Boolean(event.is_private) && (
          <div className={classes.lockIcon}>
            <FontAwesomeIcon icon={faLock} />
          </div>
        )}

        <img src={event.src} alt={event.event_name} className={classes.image} />

        <div className={classes.content}>
          <h2 className={classes.title}>{event.event_name}</h2>
          <p className={classes.category}>{event.category}</p>
          <p className={classes.city}>{event.city}</p>
          <span className={classes.viewMore}>View Details →</span>
        </div>
      </div>
    </Link>
  );
}
