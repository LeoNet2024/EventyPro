import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import classes from './resetPassword.module.css';

export default function ResetPassword() {
  const { token } = useParams(); // מקבל את הטוקן מה-URL
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirm) {
      setError('הסיסמאות אינן תואמות');
      return;
    }

    axios
      .post(`/login/reset-password/${token}`, { password })
      .then(res => {
        setMessage('הסיסמה אופסה בהצלחה! מועבר לעמוד ההתחברות...');
        setTimeout(() => navigate('/login'), 3000);
      })
      .catch(err => {
        if (err.response?.data?.error) {
          setError(err.response.data.error);
        } else {
          setError('אירעה שגיאה באיפוס הסיסמה');
        }
      });
  };

  return (
    <div className={classes.container}>
      <h2>איפוס סיסמה</h2>
      <form onSubmit={handleSubmit} className={classes.form}>
        {message && <p className={classes.success}>{message}</p>}
        {error && <p className={classes.error}>{error}</p>}

        <input
          type='password'
          placeholder='סיסמה חדשה'
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <input
          type='password'
          placeholder='אישור סיסמה'
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
        />

        <button type='submit'>אפס סיסמה</button>
      </form>
    </div>
  );
}
