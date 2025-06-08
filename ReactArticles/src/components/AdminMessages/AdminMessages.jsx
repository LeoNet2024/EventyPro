import { useEffect, useState } from "react";
import axios from "axios";
import classes from "./AdminMessages.module.css";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [replies, setReplies] = useState({});

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = () => {
    axios
      .get("/admin/adminMessages")
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Error fetching messages:", err));
  };

  const handleReplyChange = (id, value) => {
    setReplies((prev) => ({ ...prev, [id]: value }));
  };

  const handleReplySubmit = (id) => {
    const reply = replies[id];
    if (!reply) return;

    axios
      .post(`/admin/adminMessages/${id}/reply`, { reply })
      .then(() => {
        fetchMessages();
      })
      .catch((err) => console.error("Error sending reply:", err));
  };

  return (
    <div className={classes.messageContainer}>
      <h2 className={classes.sectionTitle}>Pending Messages</h2>
      {messages.length === 0 ? (
        <p>No pending messages</p>
      ) : (
        messages.map((msg) => (
          <div key={msg.message_id} className={classes.messageBox}>
            <div className={classes.fromLine}>
              <strong>{msg.user_name}</strong>{" "}
            </div>
            <h4>{msg.subject}</h4>
            <p>{msg.message}</p>
            <small>Sent on: {new Date(msg.created_at).toLocaleString()}</small>
            <textarea
              placeholder="Write your reply..."
              value={replies[msg.message_id] || ""}
              onChange={(e) =>
                handleReplyChange(msg.message_id, e.target.value)
              }
              className={classes.replyBox}
            />
            <button
              className={classes.replyButton}
              onClick={() => handleReplySubmit(msg.message_id)}
            >
              Send Reply
            </button>
          </div>
        ))
      )}
    </div>
  );
}
