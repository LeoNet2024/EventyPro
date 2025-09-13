import axios from "axios";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import classes from "./chatWithFriends.module.css";

// This Component using for chat with user friends
export default function ChatWithFriends() {
  const { user } = useAuth();

  // used to display users chat
  const [chatContent, setChatContent] = useState([]);
  // used to show friends list
  const [friendList, setFriendList] = useState([]);
  // used to send the message to server
  const [dataToSend, setDataToSend] = useState({
    sender_id: user.user_id,
    reciever_id: "",
    message: "",
  });

  // used to know which friend we want to chat with him the current time
  const [friendToChat, setFriendTochat] = useState();

  useEffect(() => {
    if (!user) return;

    axios
      .post("/chatWithFriends/listOfFriends", { user_id: user.user_id }) // send as object; keep array if your API requires it
      .then((res) => {
        setFriendList(res.data);
        loadChat();
      })
      .catch((err) => console.log(err));
  }, [friendToChat]);

  const listOfFriends = friendList.map((el) => {
    return (
      <li key={el.request_id} onClick={() => handleClick(el)}>
        {el.first_name + " " + el.last_name}
      </li>
    );
  });

  // this function handle with click on friend, in the friend list.
  // the function shuold change the chat screen and to init the reciver id
  // in other words this funciton discover the user_id of the reciver
  function handleClick(selectFriend) {
    // init the data of the message

    setDataToSend({ ...dataToSend, message: "", reciever_id: "" });

    let userToSendTheMessage = undefined;
    // In case the user is the one who send the request
    if (selectFriend.sender_id === user.user_id) {
      userToSendTheMessage = selectFriend.reciever_id;
    }
    // in case the user is the one who get the message
    else {
      userToSendTheMessage = selectFriend.sender_id;
    }
    setFriendTochat(userToSendTheMessage);

    // set new reciever_id
    setDataToSend({
      ...dataToSend,
      message: "",
      reciever_id: userToSendTheMessage,
    });

    loadChat();
  }

  // this funciton loading the chat content from the server
  function loadChat() {
    dataToSend.message = "";

    axios
      .post("chatWithFriends/getChatContent", {
        user_id: user.user_id,
        reciever_id: friendToChat,
      })
      .then((res) => {
        setChatContent(res.data);
      })
      .catch((err) => console.error(err));
  }

  // This function send the message to user
  function sendMessage() {
    // Avoid send empty message
    if (dataToSend.message.trim() === "") {
      return;
    }
    // send the message to the server using post
    axios
      .post("chatWithFriends/sendMessage", dataToSend)
      .then(() => "")
      .catch((err) => {
        console.log("API 500:", err.response?.data);
      });

    //After sending the message we want upload the new chat content
    loadChat();
  }

  // saving the message
  function handleChange(e) {
    setDataToSend({ ...dataToSend, message: e.target.value });
  }

  // For style
  const userMessage = { textAlign: "right", color: "BurlyWood" };
  const friendMessage = { textAlign: "left", color: "DarkGrey" };

  const contentChatList = chatContent.map((el) => {
    const isMe = el.sender_id === user.user_id; // if its me
    return (
      <li
        key={el.message_id}
        className={
          isMe
            ? `${classes.msg} ${classes.me}`
            : `${classes.msg} ${classes.them}`
        }
      >
        <p className={classes.time}>
          {new Date(el.messageDate).toLocaleDateString()}
        </p>
        <p className={classes.text}>{el.message}</p>
      </li>
    );
  });

  return (
    <div className={classes.chatLayout}>
      <aside className={classes.sidebar} aria-label="Friends">
        <div className={classes.sidebarHeader}>
          <h3 className={classes.title}>Friends</h3>
        </div>

        <div className="friendListWrap">
          <ul className="friendList">{listOfFriends}</ul>
        </div>
      </aside>

      <section className={classes.chatWindow} aria-label="Chat window">
        <header className={classes.chatHeader}>
          <div className={classes.chatPeer}>
            <div className={classes.peerMeta}></div>
          </div>
        </header>

        <div className={classes.messagesWrap}>
          <ul className="ChatContent">{contentChatList}</ul>
        </div>

        <footer className={classes.inputBar}>
          <input
            className={classes.input}
            type="text"
            value={dataToSend.message}
            placeholder="Type a message..."
            aria-label="Message"
            onChange={(e) => handleChange(e)}
          />
          <button
            className={classes.sendBtn}
            type="button"
            onClick={() => sendMessage()}
          >
            Send Message
          </button>
        </footer>
      </section>
    </div>
  );
}
