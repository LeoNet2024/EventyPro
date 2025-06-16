import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import classes from "./VerifyCode.module.css";

export default function VerifyCode({ userId }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    axios
      .post("/verification/verify-code", { user_id: userId, code })
      .then((res) => {
        setSuccess("האימות הצליח! מעביר אותך לעמוד הבית...");
        setTimeout(() => {
          navigate("/home");
        }, 2000);
      })
      .catch((err) => {
        if (err.response?.data?.error) {
          setError(err.response.data.error);
        } else {
          setError("שגיאה בעת אימות הקוד");
        }
      });
  };

  return (
    <div className={classes.container}>
      <h2>אימות כתובת אימייל</h2>
      <form onSubmit={handleSubmit} className={classes.form}>
        <input
          type="text"
          maxLength="6"
          placeholder="הזן את הקוד שקיבלת במייל"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />

        <button type="submit">אמת</button>

        {error && <p className={classes.error}>{error}</p>}
        {success && <p className={classes.success}>{success}</p>}
      </form>
    </div>
  );
}
