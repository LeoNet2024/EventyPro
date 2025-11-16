import React, { useEffect, useState } from "react";
import axios from "axios";
import classes from "./TopActiveUsers.module.css";

/**
 * קומפוננטה להצגת משתמשים הכי פעילים לפי כמות אירועים
 * תכונות:
 * - initialUsers: רשימת משתמשים להתחלה במקרה שכבר נטען בשרת
 * - endpoint: נתיב API שמחזיר את הטופ אקטיב יוזרז ברירת מחדל /admin/top-active-users
 * - limit: מספר שורות להצגה ברירת מחדל 10
 * הערה: מצפה לשדות user_id, first_name, last_name, email, events_attended
 */
export default function TopActiveUsers({
  initialUsers = [],
  endpoint = "/admin/top-active-users",
  limit = 10,
  title = "Most Active Users - Joined Events",
}) {
  const [rows, setRows] = useState(initialUsers.slice(0, limit));
  const [loading, setLoading] = useState(initialUsers.length === 0);
  const [error, setError] = useState("");

  // sending the session
  axios.defaults.withCredentials = true;

  useEffect(() => {
    if (initialUsers.length > 0) return;
    let mounted = true;

    setLoading(true);
    setError("");

    axios
      .get(endpoint, { params: { limit } })
      .then(({ data }) => {
        if (!mounted) return;
        setRows(Array.isArray(data) ? data.slice(0, limit) : []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError("Error in most active users");
        console.error("TopActiveUsers error:", err);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [endpoint, limit, initialUsers.length]);

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
          {rows.length === 0 && <li className={classes.empty}>No data</li>}
          {rows.map((u) => (
            <li key={u.user_id} className={classes.item}>
              <div className={classes.rowMain}>
                <span className={classes.name}>
                  {u.first_name} {u.last_name}
                </span>
                <span className={classes.count}>
                  {u.events_attended} events
                </span>
              </div>
              <div className={classes.sub}>{u.email}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
