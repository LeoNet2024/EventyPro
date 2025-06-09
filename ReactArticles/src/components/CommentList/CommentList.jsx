import { useEffect, useState } from 'react';
import axios from 'axios';
import classes from './CommentList.module.css';

export default function CommentList({ eventid, refreshTrigger }) {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    axios
      .get(`/event/${eventid}/comments`)
      .then(res => setComments(res.data))
      .catch(err => console.error('Failed to load comments:', err));
  }, [eventid, refreshTrigger]); // ← הוספת תלות ב-refreshTrigger

  const formatDateTime = datetime => {
    const date = new Date(datetime);
    return date.toLocaleString(); // תאריך + שעה
  };

  return (
    <div className={classes.commentListContainer}>
      <h3 className={classes.title}>Comments</h3>
      {comments.length === 0 && <p>No comments yet.</p>}
      {comments.map(c => (
        <div key={c.comment_id} className={classes.comment}>
          <img
            src={c.src}
            alt={`${c.first_name}'s avatar`}
            className={classes.avatar}
          />
          <div className={classes.content}>
            <p
              className={`${classes.author} ${c.is_admin ? classes.admin : ''}`}
            >
              {c.user_name}
            </p>

            <p className={classes.text}>{c.comment_content}</p>
            <p className={classes.timestamp}>
              {formatDateTime(c.comment_time)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
