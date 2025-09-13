import React from "react";
import styles from "./homePageStat.module.css";
import { useEffect } from "react";
import axios from "axios";
import { useState } from "react";

// This comp used to display some of statistic
export default function HomePageStat() {
  const [eventsByCategory, setEventsByCategory] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    // RETURN EVENTS COUNTING BY CATEGORY
    axios
      .get("/homePageStat/eventsByCategory")
      .then((res) => {
        setEventsByCategory(res.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    //FIND MOST ACTIVE USERS
    axios
      .get("/homePageStat/mostActiveUsers")
      .then((res) => {
        setActiveUsers(res.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const categoryStats = eventsByCategory.map((el) => {
    return (
      <li key={el.category}>
        Categoty: {el.category} Total: {el.Total}
      </li>
    );
  });

  const mostThreeActiveUsers = activeUsers.map((el) => {
    return (
      <li>
        User: {el.user_name} Events: {el.num_of_events}
      </li>
    );
  });

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>📊 Events by Category</h3>
      <ul className={styles.list}>{categoryStats}</ul>

      <h3 className={styles.title}>🏆 Top 3 Active Users</h3>
      <ol className={styles.list}>{mostThreeActiveUsers}</ol>
    </div>
  );
}
