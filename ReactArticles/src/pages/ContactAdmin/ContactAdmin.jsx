import { useState } from "react";
import classes from "./ContactAdmin.module.css";
import axios from "axios";
import { useEffect } from "react";

export default function ContactAdmin() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    axios
      .get("/admin/contact")
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Error loading messages:", err));
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("");

    axios
      .post("/admin/contact", { subject, message })
      .then(() => {
        setStatus("Message sent successfully.");
        setSubject("");
        setMessage("");
      })
      .catch(() => {
        setStatus("Failed to send message. Please try again.");
      });
  };

  return (
    <div className={classes.contactContainer}>
      <h2>Contact Admin</h2>
      <form onSubmit={handleSubmit} className={classes.form}>
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          className={classes.input}
        />
        <textarea
          placeholder="Your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          className={classes.textarea}
        ></textarea>
        <button type="submit" className={classes.button}>
          Send
        </button>
        {status && <p className={classes.status}>{status}</p>}
      </form>

      <h3>Previous Messages</h3>
      <div className={classes.previousMessages}>
        {messages.map((msg) => (
          <div key={msg.message_id} className={classes.messageCard}>
            <h4>{msg.subject}</h4>
            <p>{msg.message}</p>
            <p className={classes.meta}>
              Sent on: {new Date(msg.created_at).toLocaleDateString()}
            </p>
            {msg.answered ? (
              <div className={classes.reply}>
                <strong>Admin Reply:</strong>
                <p>{msg.reply}</p>
              </div>
            ) : (
              <p className={classes.pending}>Not answered yet</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
