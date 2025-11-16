import React from "react";
import classes from "./filterbar.module.css";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function Filterbar({ setFilterEvents, events, categories }) {
  const { user } = useAuth();

  const caregorySelection = categories.map((el) => {
    return (
      <option key={el.category} value={el.category}>
        {el.category}
      </option>
    );
  });

  // This function filter events by user select
  function handleFilter(filterCategory) {
    // In case user want to see the hot events
    if (filterCategory === "hotEvents") {
      axios
        .get("/filterEvents/hotEvents")
        .then((res) => {
          // Step 1 - Create list of event ids
          const listOfEventId = res.data.map((el) => el.event_id);
          // Step 2 - Return events that their event_id exists and appears the list
          setFilterEvents((prev) =>
            prev.filter((el) => listOfEventId.includes(el.event_id))
          );
        })
        .catch((err) => console.error(err));
    }
    // In case user want to see all the events
    else if (filterCategory === "all") setFilterEvents(events);
    // User city
    else if (filterCategory === "city")
      setFilterEvents((prev) => prev.filter((el) => el.city === user.city));
    else {
      setFilterEvents(events);
      setFilterEvents((prev) =>
        prev.filter((el) => el.category === filterCategory)
      );
    }
  }

  return (
    <div className={classes.filterBar}>
      <div className={classes.filterOption} onClick={() => handleFilter("all")}>
        All events
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
        >{`Events in ${user.city} `}</div>
      )}
      <div className={classes.filterOption}>
        <select onChange={(el) => handleFilter(el.target.value)}>
          <option value="all">Select Category</option>
          {caregorySelection}
        </select>
      </div>
    </div>
  );
}
