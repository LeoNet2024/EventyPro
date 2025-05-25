import React, { useState } from 'react';
import classes from './comment.module.css';

import undefined2 from '../../../../src/assets/img/logo.png';
import axios from 'axios';

export default function Comment({ eventid }) {
  const [successMsg, setSuccessMsg] = useState('');
  const [text, setText] = useState('');
  const [active, setActive] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();

    // valid comment
    if (text.trim()) {
      setText('');
      setActive(false);

      axios
        .post(`/${eventid}/addComment`, { text, event_id: eventid })
        .then(res => {
          setSuccessMsg(res.data);
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  };

  return (
    <form className={classes.commentForm} onSubmit={handleSubmit}>
      <img src={undefined2} alt='User' className={classes.commentAvatar} />
      <div className={classes.commentInputSection}>
        <textarea
          className={classes.commentTextarea}
          placeholder='Add Comment...'
          value={text}
          onFocus={() => setActive(true)}
          onChange={e => setText(e.target.value)}
          rows={active ? 3 : 1}
        />
        {active && (
          <div className={classes.commentButtons}>
            <button
              type='button'
              className={classes.cancelButton}
              onClick={() => {
                setActive(false);
                setText('');
              }}
            >
              Cancel
            </button>
            <button
              type='submit'
              className={classes.submitButton}
              disabled={!text.trim()}
            >
              Send
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
