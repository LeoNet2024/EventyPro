import classes from "./Home.module.css";
import axios from "axios";
import { useState, useEffect } from "react";
import SearchBar from "../../components/SearchBar/SearchBar";
import EventCard from "../../components/EventCard/EventCard";
import Filterbar from "../../components/Filterbar/filterbar";

/**
 * Home component displays:
 * - Page header
 * - Event search bar
 * - Featured events list
 * - (Placeholder) Filter section and map
 */
export default function Home() {
  // for all event
  const [events, setEvents] = useState([]);
  // for filtered events
  const [filterEvents, setFilterEvents] = useState([]);
  // for recent events
  const [recentEvents, setRecentEvents] = useState([]);
  //event category
  const [categories, setCategories] = useState([]);

  // Load events from backend when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch event data from backend API
  const fetchData = () => {
    axios
      .get("home")
      .then((res) => {
        setEvents(res.data);
        setFilterEvents(res.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    //getting the categories from DB
    axios
      .get("/filterEvents/getAllCategories")
      .then((res) => setCategories(res))
      .catch((err) => console.error(err));
  };

  return (
    <main>
      {/* Intro about the project */}
      <div className={classes.about}>
        <p>
          Welcome to our project! This system helps users find and manage
          events. Developed by Neo and Leon.
        </p>
      </div>

      {/* Search functionality */}
      <div className={classes.homeSearch}>
        <SearchBar events={events} />
      </div>

      {/* Event list section */}

      <h2>Featured Events</h2>
      <Filterbar
        setFilterEvents={setFilterEvents}
        events={events}
        categories={categories}
      />

      <div className={classes.featuredEvents}>
        {filterEvents &&
          filterEvents.map((event) => (
            <EventCard event={event} key={event.event_id} />
          ))}
      </div>

      {/* Placeholder for future filters and map */}
      <div className={classes.mapAndFilter}>
        <div className={classes.filters}>
          <p>Here we will have filters</p>
        </div>
        <div className={classes.map}>
          <p>Here we will have a map</p>
        </div>
      </div>
    </main>
  );
}
