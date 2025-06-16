import React from "react";
import classes from "./filterbar.module.css";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function Filterbar({ setFilterEvents, events }) {
  const { user } = useAuth();

  // This function filter events by user select
  function handleFilter(filterCategory) {
    // In case user want to see the hot events
    if (filterCategory === "hotEvents") {
      axios
        .get("/filterEvents/hotEvents")
        .then((res) => {
          // Step 1 - Create list of event ids
          const listOfEventId = res.data.map((el) => el.event_id);
          // Step 2 - Return events that their event_id exists appears the list

          setFilterEvents((prev) =>
            prev.filter((el) => listOfEventId.includes(el.event_id))
          );
        })
        .catch((err) => console.error(err));
    }
    // In case user want to see all the events
    else if (filterCategory === "all") setFilterEvents(events);
    else if (filterCategory === "city")
      setFilterEvents((prev) => prev.filter((el) => el.city === user.city));
  }

  return (
    <div className={classes.filterBar}>
      <div className={classes.filterOption} onClick={() => handleFilter("all")}>
        🔥All events
      </div>
      <div
        className={classes.filterOption}
        onClick={() => handleFilter("hotEvents")}
      >
        🔥 Hot Events
      </div>

      {user && (
        <div
          className={classes.filterOption}
          onClick={() => handleFilter("city")}
        >
          🏙️ By City
        </div>
      )}
      <div
        className={classes.filterOption}
        onClick={() => handleFilter("category")}
      >
        📂 By Category
      </div>
    </div>
  );
}
