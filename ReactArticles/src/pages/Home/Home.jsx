import classes from "./Home.module.css";
import axios from "axios";
import { useState, useEffect } from "react";
import SearchBar from "../../components/SearchBar/SearchBar";
import EventCard from "../../components/EventCard/EventCard";
import Filterbar from "../../components/Filterbar/filterbar";
import MapComponent from "../../components/MapComponent/MapComponent";
import HomePageStat from "../../components/homePageStat/homePageStat";

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

  //List of markers - > should be relocate to different file
  const [eventsMarksFromDB, setEventsMarksFromDB] = useState([]);

  // create a custom format for map comp
  const listOfEventsMarks = eventsMarksFromDB.map((el) => {
    return {
      name: el.event_name,
      description: el.name_heb,
      position: [el.latitude, el.longitude],עןא
    };
  });

  console.log(listOfEventsMarks);

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
      .then((res) => setCategories(res.data))
      .catch((err) => console.error(err));

    axios
      .get("home/getEventsPositions")
      .then((res) => setEventsMarksFromDB(res.data))
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
          <HomePageStat />
        </div>
        <div className={classes.map}>
          <MapComponent
            center={[32.0853, 34.7818]}
            markers={listOfEventsMarks}
          />
        </div>
      </div>
    </main>
  );
}
