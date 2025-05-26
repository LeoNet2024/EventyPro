import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import classes from './EventView.module.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CommentList from '../CommentList/CommentList';

import Comment from '../../components/forms/comment/comment';

import ParticipantsList from '../participantsList/participantsList';

export default function EventView() {
  // use for navigate
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [event, setEvent] = useState(null);

  // event id from URL local..../{id}
  const { id } = useParams();

  const [participants, setParticipants] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = () => {
    Promise.all([
      axios.get(`/event/${id}`),
      axios.get(`/event/${id}/participants`),
    ])
      .then(([eventRes, participantsRes]) => {
        setEvent(eventRes.data);
        setParticipants(participantsRes.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  };

  // this function adding participants to events
  function handleJoin() {
    const payload = {
      user_id: user.user_id,
      event_id: id,
    };

    axios
      .post(`/event/${id}/joinEvent`, payload)
      .then(res => {
        alert('you joined to event successfully');
        navigate('/home');
      })
      .catch(error => {
        console.error('Error:', error);
        alert('you are already joined');
      });
  }

  const formatDate = dateString => {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = timeString => {
    if (!timeString) return '-';
    return timeString.substring(0, 5);
  };

  if (!event) {
    return <p className={classes.loading}>Loading event details...</p>;
  }

  return (
    <div className={classes.eventContainer}>
      <h2 className={classes.eventTitle}>{event.event_name}</h2>
      <div className={classes.eventGrid}>
        <div>
          <strong>Event ID:</strong> {event.event_id}
        </div>
        <div>
          <strong>Category:</strong> {event.category || '-'}
        </div>
        <div>
          <strong>Start Date:</strong> {formatDate(event.start_date)}
        </div>
        <div>
          <strong>End Date:</strong> {formatDate(event.end_date)}
        </div>
        <div>
          <strong>Start Time:</strong> {formatTime(event.start_time)}
        </div>
        <div>
          <strong>City:</strong> {event.city || '-'}
        </div>
        <div>
          <strong>Participants:</strong> {event.participant_amount ?? '-'}
        </div>
        <div>
          <strong>Private:</strong> {event.is_private ? 'Yes' : 'No'}
        </div>
        <div>
          <img src={event.src} alt='' />
        </div>
      </div>
      <div>
        <h2>participants : {participants.map(p => p.user_name)}</h2>
        <ParticipantsList />
        {user && <button onClick={handleJoin}>Join Event</button>}
      </div>
      {user && <Comment eventid={id} />}
      <CommentList eventid={id} />
    </div>
  );
}
