import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import classes from "./EventView.module.css";
import { useAuth } from "../../context/AuthContext";

import CommentList from "../CommentList/CommentList";
import Comment from "../../components/forms/comment/comment";
import ParticipantsList from "../participantsList/participantsList";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faClock,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";

export default function EventView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]); // NEW
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [refreshComments, setRefreshComments] = useState(false);

  const [requestNote, setRequestNote] = useState("");
  const [loadingJoin, setLoadingJoin] = useState(false);
  const [myStatus, setMyStatus] = useState("none"); // none | pending | approved | rejected

  const [editingDescription, setEditingDescription] = useState(false);
  const [tempDesc, setTempDesc] = useState("");
  const [savingDesc, setSavingDesc] = useState(false);

  const [creator, setCreator] = useState(null);

  function getInitials(first = "", last = "", email = "") {
    const a = (first || "").trim()[0] || "";
    const b = (last || "").trim()[0] || "";
    if (a || b) return (a + b).toUpperCase();
    return (email.trim()[0] || "?").toUpperCase();
  }

  const isOwner = useMemo(
    () => !!(user && event && user.user_id === event.created_by),
    [user, event]
  );

  useEffect(() => {
    fetchData();
    setSuccessMsg("");
    setErrorMsg("");
    setRequestNote("");
    setMyStatus("none");
  }, [id]);

  useEffect(() => {
    if (isOwner && event) fetchPending(); // owner sees pending list
  }, [isOwner, event]);

  const fetchData = () => {
    Promise.all([
      axios.get(`/event/${id}`),
      axios.get(`/event/${id}/participants`),
      axios.get(`/event/${id}/creator`),
    ])
      .then(([eventRes, participantsRes, creatorRes]) => {
        setEvent(eventRes.data);
        const plist = Array.isArray(participantsRes.data)
          ? participantsRes.data
          : [];
        setParticipants(plist);

        // set creator if available, otherwise try to derive from event payload if it already includes fields
        const c = creatorRes?.data || {
          first_name: eventRes?.data?.first_name,
          last_name: eventRes?.data?.last_name,
          email: eventRes?.data?.email,
          avatar_url: eventRes?.data?.src,
        };
        if (c && (c.first_name || c.last_name || c.email)) setCreator(c);

        if (user) {
          const me = plist.find((p) => p.user_id === user.user_id);
          if (me && me.status) setMyStatus(me.status);
          else if (me) setMyStatus("approved");
          else setMyStatus("none");
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setErrorMsg("Failed to load event data");
      });
  };

  const fetchPending = () => {
    axios
      .get(`/event/${id}/requests`)
      .then(({ data }) => {
        setPendingRequests(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Pending requests error:", err);
        // לא מציג שגיאה ליוזר כדי לא להכביד אם הנתיב עוד לא קיים
      });
  };

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
        setSuccessMsg("Event deleted successfully.");
        setTimeout(() => navigate("/home"), 2000);
      })
      .catch((error) => {
        console.error("Error deleting event:", error);
        setErrorMsg(
          "You are not authorized to delete this event or an error occurred."
        );
      });
  };

  // Start editing the description
  const startEditDesc = () => {
    setTempDesc(event?.description || "");
    setEditingDescription(true);
  };

  // Cancel editing the description
  const cancelEditDesc = () => {
    setEditingDescription(false);
    setTempDesc("");
  };

  // Saving the description edit
  const saveDesc = async () => {
    if (!event) return;
    setSavingDesc(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await axios.patch(`/event/${id}/description`, {
        description: (tempDesc || "").trim(),
      });
      // update local event state for instant UI feedback
      setEvent((prev) => ({ ...prev, description: (tempDesc || "").trim() }));
      setSuccessMsg("Description updated.");
      setEditingDescription(false);
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        "Failed to update description.";
      setErrorMsg(msg);
    } finally {
      setSavingDesc(false);
    }
  };

  const handleJoinOrRequest = async () => {
    if (!user || !event) return;
    setSuccessMsg("");
    setErrorMsg("");
    setLoadingJoin(true);

    try {
      if (event.is_private) {
        const { data } = await axios.post(`event/${id}/join-or-request`, {
          note: requestNote.trim() || undefined,
        });
        if (data?.status === "pending") {
          setMyStatus("pending");
          setSuccessMsg(
            data?.message || "Your request was sent and is pending approval."
          );
        } else if (data?.status === "approved") {
          setMyStatus("approved");
          setSuccessMsg(data?.message || "You joined the event successfully!");
          fetchData();
        } else {
          setSuccessMsg(data?.message || "Request sent.");
        }
        if (isOwner) fetchPending();
      } else {
        await axios.post(`/event/${id}/joinEvent`, {
          user_id: user.user_id,
          event_id: id,
        });
        setMyStatus("approved");
        setSuccessMsg("You joined the event successfully!");
        fetchData();
      }
    } catch (error) {
      console.error("Join/Request error:", error);
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "You are already joined or something went wrong.";
      setErrorMsg(msg);
    } finally {
      setLoadingJoin(false);
    }
  };

  const approveRequest = async (targetUserId) => {
    try {
      await axios.post(`/event/${id}/requests/${targetUserId}/approve`);
      setSuccessMsg("Request approved");
      fetchPending();
      fetchData();
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        "Approve failed";
      setErrorMsg(msg);
    }
  };

  const rejectRequest = async (targetUserId) => {
    try {
      await axios.post(`/event/${id}/requests/${targetUserId}/reject`);
      setSuccessMsg("Request rejected");
      fetchPending();
      fetchData();
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        "Reject failed";
      setErrorMsg(msg);
    }
  };

  useEffect(() => {
    if (successMsg) {
      const t1 = setTimeout(() => setSuccessMsg(""), 3000);
      return () => clearTimeout(t1);
    }
  }, [successMsg]);

  useEffect(() => {
    if (errorMsg) {
      const t2 = setTimeout(() => setErrorMsg(""), 4000);
      return () => clearTimeout(t2);
    }
  }, [errorMsg]);

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

  const isPrivate = !!event.is_private;
  const isJoined = myStatus === "approved";
  const isPending = myStatus === "pending";
  const isRejected = myStatus === "rejected";

  let joinBtnText = "Join Event";
  if (isPrivate) {
    if (isPending) joinBtnText = "Request sent waiting for approval";
    else if (isJoined) joinBtnText = "Joined";
    else if (isRejected) joinBtnText = "Request rejected";
    else joinBtnText = "Request to join";
  } else {
    if (isJoined) joinBtnText = "Joined";
  }

  const disableJoin =
    loadingJoin || isJoined || isPending || (isPrivate && isRejected);

  // נאפשר להציג בימין רק מאושרים לפאנל המשתתפים
  const approvedParticipants = Array.isArray(participants)
    ? participants.filter((p) => !p.status || p.status === "approved")
    : [];

  const canView = !isPrivate || isJoined || isOwner;

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
      {isPrivate && (
        <div className={classes.privateNotice}>
          🔒 This is a private event. You must be approved to view all the
          details.
        </div>
      )}

      <div className={classes.mainContent}>
        <div className={classes.left}>
          <div className={classes.eventDetails}>
            {canView ? (
              <div className={classes.descRow}>
                {!editingDescription ? (
                  <span className={classes.descText}>
                    {event.description?.trim()?.length
                      ? event.description
                      : "-"}
                  </span>
                ) : (
                  <textarea
                    className={classes.descTextarea}
                    value={tempDesc}
                    onChange={(e) => setTempDesc(e.target.value)}
                    rows={4}
                    maxLength={1000}
                    placeholder="Update event description"
                  />
                )}

                {isOwner && !editingDescription && (
                  <button
                    type="button"
                    onClick={startEditDesc}
                    className={classes.editDescBtn}
                  >
                    Edit
                  </button>
                )}

                {isOwner && editingDescription && (
                  <div className={classes.descActions}>
                    <button
                      type="button"
                      onClick={saveDesc}
                      className={classes.saveDescBtn}
                      disabled={savingDesc}
                    >
                      {savingDesc ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditDesc}
                      className={classes.cancelDescBtn}
                      disabled={savingDesc}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className={classes.hiddenText}>
                Description hidden - you must be joined to view this part
              </p>
            )}

            <p>
              <FontAwesomeIcon icon={faCalendarAlt} /> <strong>Date:</strong>{" "}
              {formatDate(event.start_date)}
            </p>
            <p>
              <FontAwesomeIcon icon={faCalendarAlt} />{" "}
              <strong>End Date:</strong> {formatDate(event.end_date)}
            </p>
            {canView ? (
              <p>
                <FontAwesomeIcon icon={faClock} /> <strong>Time:</strong>{" "}
                {formatTime(event.start_time)}
              </p>
            ) : (
              <p className={classes.hiddenText}>
                Time hidden - you must be joined to view this part
              </p>
            )}
            <p>
              <FontAwesomeIcon icon={faMapMarkerAlt} /> <strong>City:</strong>{" "}
              {event.city || "-"}
            </p>
            <p>
              <strong>Private:</strong> {event.is_private ? "Yes" : "No"}
            </p>
            <p>
              <strong>Max Participants:</strong>{" "}
              {event.participant_amount ?? "-"}
            </p>
          </div>

          {user && !isOwner && isPrivate && myStatus === "none" && (
            <div className={classes.requestCard}>
              <div className={classes.requestHeader}>
                <h4 className={classes.requestTitle}>
                  Message to the event creator
                </h4>
                <div className={classes.requestHint}>
                  Optional but recommended
                </div>
              </div>

              <textarea
                id="requestNote"
                className={classes.requestTextareaLarge}
                placeholder="Tell the creator why you want to join, relevant details, friends coming, previous experience ועוד"
                value={requestNote}
                onChange={(e) => setRequestNote(e.target.value)}
                maxLength={400}
              />

              <div className={classes.requestFooter}>
                <span className={classes.charCount}>
                  {requestNote.length}/400
                </span>
              </div>
            </div>
          )}

          {user && !isOwner && (
            <button
              onClick={handleJoinOrRequest}
              className={
                disableJoin
                  ? `${classes.joinButtonPrimary} ${classes.joinButtonPrimaryDisabled}`
                  : classes.joinButtonPrimary
              }
              disabled={disableJoin}
            >
              {loadingJoin ? "Processing..." : joinBtnText}
            </button>
          )}

          {user && isOwner && (
            <button onClick={handleDelete} className={classes.deleteButton}>
              Delete Event
            </button>
          )}

          {user && isOwner && (
            <div className={classes.ownerPanel}>
              <h3 className={classes.panelTitle}>Pending requests</h3>

              {!pendingRequests.length && (
                <div className={classes.emptyBox}>No pending requests</div>
              )}

              {!!pendingRequests.length && (
                <ul className={classes.pendingList}>
                  {pendingRequests.map((r) => (
                    <li key={r.user_id} className={classes.pendingItem}>
                      <div className={classes.pendingInfo}>
                        <div className={classes.pendingName}>
                          {r.first_name} {r.last_name}
                        </div>
                        <div className={classes.pendingEmail}>{r.email}</div>
                        {r.request_note && (
                          <div className={classes.pendingNote}>
                            {r.request_note}
                          </div>
                        )}
                      </div>
                      <div className={classes.pendingActions}>
                        <button
                          className={classes.approveBtn}
                          onClick={() => approveRequest(r.user_id)}
                          title="Approve"
                        >
                          Approve
                        </button>
                        <button
                          className={classes.rejectBtn}
                          onClick={() => rejectRequest(r.user_id)}
                          title="Reject"
                        >
                          Reject
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {canView ? (
            <CommentList eventid={id} refreshTrigger={refreshComments} />
          ) : (
            <p className={classes.hiddenText}>
              Comments hidden - you must be joined to view this part
            </p>
          )}

          {user && canView && (
            <Comment
              eventid={id}
              setSuccessMsg={setSuccessMsg}
              triggerRefresh={() => setRefreshComments((prev) => !prev)}
            />
          )}
        </div>

        <div className={classes.right}>
          {creator && (
            <div className={classes.creatorCard}>
              <div className={classes.creatorHeader}>Created by</div>

              <div className={classes.creatorBody}>
                {creator.avatar_url ? (
                  <img
                    className={classes.creatorAvatar}
                    src={creator.avatar_url}
                    alt={`${creator.first_name || ""} ${
                      creator.last_name || ""
                    }`}
                  />
                ) : (
                  <div className={classes.creatorAvatarFallback}>
                    {getInitials(
                      creator.first_name,
                      creator.last_name,
                      creator.email
                    )}
                  </div>
                )}

                <div className={classes.creatorMeta}>
                  <div className={classes.creatorName}>
                    {(creator.first_name || "") +
                      " " +
                      (creator.last_name || "")}
                  </div>
                  {creator.email && (
                    <a
                      href={`mailto:${creator.email}`}
                      className={classes.creatorEmail}
                    >
                      {creator.email}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {canView ? (
            <ParticipantsList
              participants={approvedParticipants}
              maxParticipants={event.participant_amount}
            />
          ) : (
            <p className={classes.hiddenText}>
              Participants hidden - you must be joined to view this part
            </p>
          )}
        </div>
      </div>

      {(successMsg || errorMsg) && (
        <div
          className={`${classes.toast} ${
            errorMsg ? classes.toastError : classes.toastSuccess
          }`}
        >
          {errorMsg || successMsg}
        </div>
      )}
    </>
  );
}
