import React, { useState, useEffect, useRef } from 'react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

const Chat = ({ room, user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatContainerRef = useRef(null);
  const ws = useRef(null);

  useEffect(() => {
    if (!room || !user) return; // Ensure room and user are available

    ws.current = new W3CWebSocket(`ws://localhost:3000`); // Replace with your websocket server url

    ws.current.onopen = () => {
      console.log('WebSocket Client Connected');
    };

    ws.current.onmessage = (message) => {
      try {
        const data = JSON.parse(message.data);
        if (data.room === room) {
          setMessages((prevMessages) => [...prevMessages, { user: data.user, message: data.message }]);
        }
      } catch (e) {
        console.error("Error parsing message", e);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket Client Disconnected');
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [room, user]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSendMessage = () => {
    if (input.trim() && ws.current && ws.current.readyState === W3CWebSocket.OPEN) {
      const message = { room, user, message: input };
      ws.current.send(JSON.stringify(message));
      setInput('');
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', height: '300px', display: 'flex', flexDirection: 'column' }}>
      <div
        ref={chatContainerRef}
        style={{ overflowY: 'auto', flex: 1, marginBottom: '10px' }}
      >
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.user}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex' }}>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          style={{ flex: 1, padding: '5px' }}
        />
        <button onClick={handleSendMessage} style={{ padding: '5px 10px' }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;