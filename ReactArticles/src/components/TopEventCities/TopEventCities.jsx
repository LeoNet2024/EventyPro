import React, { useEffect, useState } from "react";
import axios from "axios";
import classes from "./TopEventCities.module.css";

/**
 * מציג ערים עם הכי הרבה אירועים
 * שדות נדרשים מהשרת: city, events_count
 */
export default function TopEventCities({
  endpoint = "/admin/top-event-cities",
  limit = 10,
  initialCities = [],
  title = "Top Event Cities",
}) {
  const [rows, setRows] = useState(initialCities.slice(0, limit));
  const [loading, setLoading] = useState(initialCities.length === 0);
  const [error, setError] = useState("");

  axios.defaults.withCredentials = true;

  useEffect(() => {
    if (initialCities.length > 0) return;
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
        setError("Error TopEvent Cities");
        console.error("TopEventCities error:", err);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [endpoint, limit, initialCities.length]);

  return (
    <section className={classes.card}>
      <h3 className={classes.cardTitle}>{title}</h3>

      {loading && (
        <ul className={classes.list}>
          {Array.from({ length: Math.min(5, limit) }).map((_, i) => (
            <li key={i} className={`${classes.item} ${classes.skeleton}`}>
              <div className={classes.rowMain}>
                <span className={classes.city} />
                <span className={classes.count} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && error && <div className={classes.errorBox}>{error}</div>}

      {!loading && !error && (
        <ul className={classes.list}>
          {rows.length === 0 && (
            <li className={classes.empty}>No data to show</li>
          )}
          {rows.map((r, i) => (
            <li key={r.city + i} className={classes.item}>
              <div className={classes.rowMain}>
                <span className={classes.city}>{r.city}</span>
                <span className={classes.count}>{r.events_count} events</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
