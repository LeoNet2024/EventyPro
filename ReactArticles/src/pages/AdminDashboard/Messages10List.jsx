// components/Messages10List/Messages10List.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import classes from "./Messages10List.module.css";

/**
 * Props:
 * - initialMessages: array of messages [{ message_id, subject, message, created_at, answered, user_name? }, ...]
 * - onRefetch?: optional callback to refresh messages from parent after reply
 * - replyEndpointBuilder?: optional function (id) => string  // default: `/admin/adminMessages/${id}/reply`
 */
export default function Messages10List({
  initialMessages = [],
  onRefetch,
  replyEndpointBuilder,
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [replies, setReplies] = useState({}); // { [message_id]: text }
  const [sending, setSending] = useState({}); // { [message_id]: boolean }
  const buildReplyUrl =
    replyEndpointBuilder || ((id) => `/admin/adminMessages/${id}/reply`); // ברירת מחדל כמו בדוגמה שלך

  useEffect(() => setMessages(initialMessages), [initialMessages]);

  const handleReplyChange = (id, value) => {
    setReplies((prev) => ({ ...prev, [id]: value }));
  };

  const handleReplySubmit = async (id) => {
    const reply = (replies[id] || "").trim();
    if (!reply) return;

    try {
      setSending((s) => ({ ...s, [id]: true }));
      await axios.post(buildReplyUrl(id), { reply });

      // אופציונלי: רענון מהרודף
      if (typeof onRefetch === "function") onRefetch();

      // אופטימיסטי: ננקה את הטקסט ונסמן כ-answered
      setReplies((prev) => ({ ...prev, [id]: "" }));
      setMessages((prev) =>
        prev.map((m) => (m.message_id === id ? { ...m, answered: 1 } : m))
      );
    } catch (err) {
      console.error("Error sending reply:", err);
      alert("Failed to send reply");
    } finally {
      setSending((s) => ({ ...s, [id]: false }));
    }
  };

  if (!messages.length) return <p>No admin messages.</p>;

  return (
    <div className={classes.grid}>
      {messages.map((m) => (
        <div key={m.message_id} className={classes.card}>
          <h4 className={classes.subject}>{m.subject}</h4>
          <p className={classes.body}>{m.message}</p>
          <small className={classes.meta}>
            {new Date(m.created_at).toLocaleString()} •{" "}
            {m.answered ? "Answered" : "Pending"}
          </small>

          {/* טופס תגובה – נציג תמיד, או רק כשלא נענה עדיין */}
          {!m.answered && (
            <div className={classes.replyArea}>
              <textarea
                className={classes.replyBox}
                placeholder="Write your reply…"
                value={replies[m.message_id] || ""}
                onChange={(e) =>
                  handleReplyChange(m.message_id, e.target.value)
                }
                rows={3}
                maxLength={1000}
              />
              <button
                className={classes.replyButton}
                onClick={() => handleReplySubmit(m.message_id)}
                disabled={sending[m.message_id]}
                title="Send Reply"
              >
                {sending[m.message_id] ? "Sending…" : "Send Reply"}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
