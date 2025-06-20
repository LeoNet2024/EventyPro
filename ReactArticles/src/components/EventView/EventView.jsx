import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import classes from "./EventView.module.css";
import { useAuth } from "../../context/AuthContext";

import CommentList from "../CommentList/CommentList";
import Comment from "../../components/forms/comment/comment";
import ParticipantsList from "../participantsList/participantsList";

export default function EventView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [refreshComments, setRefreshComments] = useState(false);

  const handleDelete = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );
    if (!confirmed) return;

    axios
      .post("/event/deleteEvent", {
        event_id: id,
        user_id: user.user_id,
      })
      .then(() => {
        alert("Event deleted successfully.");
        navigate("/home");
      })
      .catch((error) => {
        console.error("Error deleting event:", error);
        alert(
          "You are not authorized to delete this event or an error occurred."
        );
      });
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = () => {
    Promise.all([
      axios.get(`/event/${id}`),
      axios.get(`/event/${id}/participants`),
    ])
      .then(([eventRes, participantsRes]) => {
        console.log("Fetched Event:", eventRes.data);
        setEvent(eventRes.data);
        setParticipants(participantsRes.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const handleJoin = () => {
    const payload = {
      user_id: user.user_id,
      event_id: id,
    };

    axios
      .post(`/event/${id}/joinEvent`, payload)
      .then(() => {
        alert("You joined the event successfully!");
        navigate("/home");
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("You are already joined or something went wrong.");
      });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    return timeString.substring(0, 5);
  };

  if (!event) {
    return <p className={classes.loading}>Loading event details...</p>;
  }

  return (
    <>
      <div className={classes.hero}>
        <img
          src={event.src}
          alt={event.event_name}
          className={classes.heroImage}
        />
        <div className={classes.overlay}>
          <h1 className={classes.title}>{event.event_name}</h1>
          <p className={classes.subtitle}>{event.category}</p>
        </div>
      </div>

      <div className={classes.mainContent}>
        <div className={classes.left}>
          <div className={classes.eventDetails}>
            <p>
              <strong>Date:</strong> {formatDate(event.start_date)}
            </p>
            <p>
              <strong>End Date:</strong> {formatDate(event.end_date)}
            </p>
            <p>
              <strong>Time:</strong> {formatTime(event.start_time)}
            </p>
            <p>
              <strong>City:</strong> {event.city || "-"}
            </p>
            <p>
              <strong>Private:</strong> {event.is_private ? "Yes" : "No"}
            </p>
            <p>
              <strong>Max Participants:</strong>{" "}
              {event.participant_amount ?? "-"}
            </p>
          </div>

          {user && (
            <button onClick={handleJoin} className={classes.joinButton}>
              Join Event
            </button>
          )}
          {user && event.created_by === user.user_id && (
            <button onClick={handleDelete} className={classes.deleteButton}>
              Delete Event
            </button>
          )}

          <CommentList eventid={id} refreshTrigger={refreshComments} />
          {user && (
            <Comment
              eventid={id}
              setSuccessMsg={setSuccessMsg}
              triggerRefresh={() => setRefreshComments((prev) => !prev)}
            />
          )}
        </div>

        <div className={classes.right}>
          <ParticipantsList
            participants={participants}
            maxParticipants={event.participant_amount}
          />
        </div>
      </div>
    </>
  );
}
