import { useState } from 'react';
import axios from 'axios';
import classes from './forgotPassword.module.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    setMessage('');
    setError('');

    axios
      .post('/login/users/forgot-password', { email }) // ← מסלול ה-API שלך
      .then(res => {
        setMessage(res.data.message || 'קישור לאיפוס סיסמה נשלח למייל שלך');
      })
      .catch(err => {
        if (err.response?.data?.error) {
          setError(err.response.data.error);
        } else {
          setError('אירעה שגיאה בשליחה');
        }
      });
  };

  return (
    <div className={classes.container}>
      <h2>שחזור סיסמה</h2>
      <form onSubmit={handleSubmit} className={classes.form}>
        {message && <p className={classes.success}>{message}</p>}
        {error && <p className={classes.error}>{error}</p>}

        <input
          type='email'
          placeholder='הכנס את כתובת המייל שלך'
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className={classes.input}
        />

        <button type='submit' className={classes.button}>
          שלח קישור לאיפוס
        </button>
      </form>
    </div>
  );
}
