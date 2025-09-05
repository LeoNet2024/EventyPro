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
  console.log("home");
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
      position: [el.latitude, el.longitude],
    };
  });

  console.log(listOfEventsMarks);

  // Load events from backend when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch event data from backend API
  const fetchData = () => {
    // קודם מעדכן סטטוסים בשרת
    axios
      .get("/updatePastEvents/")
      .then(() => {
        axios
          .get("home")
          .then((res) => {
            setEvents(res.data);
            setFilterEvents(res.data);
          })
          .catch((error) => {
            console.error("Error:", error);
          });

        // Category
        axios
          .get("/filterEvents/getAllCategories")
          .then((res) => setCategories(res.data))
          .catch((err) => console.error(err));

        // Events position
        axios
          .get("home/getEventsPositions")
          .then((res) => setEventsMarksFromDB(res.data))
          .catch((err) => console.error(err));
      })
      .catch((err) => {
        console.error("update-past-events failed:", err);

        // גם אם העדכון נכשל — נטען את שאר הנתונים
        axios
          .get("home")
          .then((res) => {
            setEvents(res.data);
            setFilterEvents(res.data);
          })
          .catch((error) => {
            console.error("Error:", error);
          });

        axios
          .get("/filterEvents/getAllCategories")
          .then((res) => setCategories(res.data))
          .catch((err) => console.error(err));

        axios
          .get("home/getEventsPositions")
          .then((res) => setEventsMarksFromDB(res.data))
          .catch((err) => console.error(err));
      });
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

      <section className={classes.sectionCard}>
        {/* Search functionality */}
        <div className={classes.homeSearch}>
          <SearchBar events={events} />
        </div>

        {/* Event list section */}
        <div className={classes.sectionHeader}>
          <h2 className={classes.sectionTitle}>Featured Events</h2>

          <div className={classes.sectionMeta}>
            <span className={classes.resultCount}>
              {filterEvents?.length ?? 0} results
            </span>
          </div>
        </div>

        <div className={classes.sectionBody}>
          <Filterbar
            setFilterEvents={setFilterEvents}
            events={events}
            categories={categories}
          />
        </div>
      </section>

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
