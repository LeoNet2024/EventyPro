import React from "react";
import classes from "./filterbar.module.css";
import axios from "axios";

export default function Filterbar({ events, setEvents }) {
  // This function filter events by user select
  function handleFilter(filterCategory, events) {
    if (filterCategory === "hotEvents") {
      axios
        .get("/filterEvents/hotEvents")
        .then((res) => {
          console.log(res.data);
          setEvents(res.data);
        })
        .catch((err) => console.error(err));
    }
  }

  return (
    <div className={classes.filterBar}>
      <div
        className={classes.filterOption}
        onClick={() => handleFilter("hotEvents")}
      >
        🔥 Hot Events
      </div>

      <div
        className={classes.filterOption}
        onClick={() => handleFilter("City")}
      >
        🏙️ By City
      </div>
      <div
        className={classes.filterOption}
        onClick={() => handleFilter("Category")}
      >
        📂 By Category
      </div>
    </div>
  );
}
