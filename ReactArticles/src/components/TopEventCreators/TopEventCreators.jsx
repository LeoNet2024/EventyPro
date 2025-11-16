import React, { useEffect, useState } from "react";
import axios from "axios";
import classes from "./TopEventCreators.module.css";

/**
 * מציג יוצרים מובילים לפי כמות אירועים שיצרו
 * - endpoint: נתיב API (ברירת מחדל /admin/top-event-creators)
 * - limit: כמה רשומות להביא
 * - initialCreators: נתונים התחלתיים אם כבר נטענו בשרת
 */
export default function TopEventCreators({
  endpoint = "/admin/top-event-creators",
  limit = 10,
  initialCreators = [],
  title = "Top Event Creators",
}) {
  const [rows, setRows] = useState(initialCreators.slice(0, limit));
  const [loading, setLoading] = useState(initialCreators.length === 0);
  const [error, setError] = useState("");

  axios.defaults.withCredentials = true;

  useEffect(() => {
    if (initialCreators.length > 0) return;
    let mounted = true;
    setLoading(true);
    setError("");

    axios
      .get(endpoint, { params: { limit } })
      .then(
        ({ data }) =>
          mounted && setRows(Array.isArray(data) ? data.slice(0, limit) : [])
      )
      .catch((err) => {
        if (!mounted) return;
        setError("Error top event creators");
        console.error("TopEventCreators error:", err);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [endpoint, limit, initialCreators.length]);

  return (
    <section className={classes.card}>
      <h3 className={classes.cardTitle}>{title}</h3>

      {loading && (
        <ul className={classes.list}>
          {Array.from({ length: Math.min(5, limit) }).map((_, i) => (
            <li key={i} className={`${classes.item} ${classes.skeleton}`}>
              <div className={classes.rowMain}>
                <span className={classes.name} />
                <span className={classes.count} />
              </div>
              <div className={classes.sub} />
            </li>
          ))}
        </ul>
      )}

      {!loading && error && <div className={classes.errorBox}>{error}</div>}

      {!loading && !error && (
        <ul className={classes.list}>
          {rows.length === 0 && (
            <li className={classes.empty}>No Data to show</li>
          )}
          {rows.map((u) => (
            <li key={u.user_id} className={classes.item}>
              <div className={classes.rowMain}>
                <span className={classes.name}>
                  {u.first_name} {u.last_name}
                </span>
                <span className={classes.count}>{u.events_created} events</span>
              </div>
              <div className={classes.sub}>{u.email}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
