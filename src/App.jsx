import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Backend URL

function App() {
  const [username, setUsername] = useState('');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]); // Store chat messages
  const [users, setUsers] = useState([]); // Store users
  const [loading, setLoading] = useState(true); // Loading state
  const [joined, setJoined] = useState(false); // Track if user has joined

  // Fetch messages where the user is the recipient
  useEffect(() => {
    const fetchMessages = async () => {
      if (username) {
        try {
          const response = await axios.get(`http://localhost:5000/api/chat/messages/${username}`);
          setChat(response.data); // Set the chat messages
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      }
    };

    fetchMessages();
  }, [username]);

  useEffect(() => {
    socket.on('receive_message', ({ from, message }) => {
      setChat((prevChat) => [...prevChat, { sender: from, message }]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, []);

  const joinChat = () => {
    if (!username.trim()) {
      alert('Please enter a username.');
      return;
    }
    socket.emit('join', username);
    setJoined(true);
  };

  const sendMessage = () => {
    if (!recipient || !message.trim()) {
      alert('Please enter a recipient and a message.');
      return;
    }
    socket.emit('send_message', { to: recipient, message });
    setChat((prevChat) => [...prevChat, { sender: 'You', message }]); // Update chat with sent message
    setMessage('');
  };

  return (
    <div>
      {!joined ? (
        <div>
          <h2>Enter your name to join the chat</h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your name"
          />
          <button onClick={joinChat}>Join</button>
        </div>
      ) : (
        <div>
          <h1>Welcome, {username}</h1>
          <div>
            <input
              type="text"
              placeholder="Recipient's name"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Type a message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
          <div>
            <h3>Chat:</h3>
            {chat.length === 0 ? (
              <p>No messages yet.</p>
            ) : (
              chat.map((msg, index) => (
                <p key={index}>
                  <strong>{msg.sender}:</strong> {msg.message}
                </p>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
