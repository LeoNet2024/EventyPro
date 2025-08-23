import React from "react";
import classes from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={classes.footer}>
      <div className={classes.container}>
        <div className={classes.section}>
          <h3 className={classes.title}>EventyPro</h3>
          <p className={classes.text}>
            Bringing people together through events worldwide 🌍
          </p>
        </div>

        <div className={classes.section}>
          <h4 className={classes.subtitle}>Quick Links</h4>
          <ul className={classes.links}>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
          </ul>
        </div>

        <div className={classes.section}>
          <div className={classes.socials}></div>
        </div>
      </div>

      <div className={classes.copy}>
        © {new Date().getFullYear()} EventyPro. All rights reserved.
      </div>
    </footer>
  );
}
