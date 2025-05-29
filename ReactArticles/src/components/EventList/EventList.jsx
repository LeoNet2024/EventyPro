import { useEffect, useState } from "react";
import axios from "axios";
import classes from "./EventList.module.css";
import EventSearchBar from "../../components/EventSearchBar/EventSearchBar";
import SortableHeader from "../SortableHeader";

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [sortBy, setSortBy] = useState("event_name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    axios
      .get("/admin/events")
      .then((res) => setEvents(res.data))
      .catch((err) => console.error("Error fetching events:", err));
  };

  const handleDelete = (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      axios
        .delete(`/admin/events/${eventId}`)
        .then(() => fetchEvents())
        .catch((err) => console.error("Error deleting event:", err));
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const filteredEvents = events
    .filter((event) =>
      `${event.event_name} ${event.category} ${event.city}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (typeof aValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

  return (
    <div className={classes.eventList}>
      <h2 className={classes.sectionTitle}>Manage Events</h2>
      <EventSearchBar search={search} setSearch={setSearch} />
      <table>
        <thead>
          <tr>
            <SortableHeader
              field="event_name"
              label="Event Name"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
            <SortableHeader
              field="category"
              label="Category"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
            <SortableHeader
              field="city"
              label="City"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
            <SortableHeader
              field="start_date"
              label="Date"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
            <SortableHeader
              field="participant_amount"
              label="Participants"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEvents.map((event) => (
            <tr key={event.event_id}>
              <td>{event.event_name}</td>
              <td>{event.category}</td>
              <td>{event.city}</td>
              <td>{event.start_date?.slice(0, 10)}</td>
              <td style={{ paddingLeft: "3em" }}>{event.participant_amount}</td>
              <td>
                <button
                  className={classes.delete}
                  onClick={() => handleDelete(event.event_id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
