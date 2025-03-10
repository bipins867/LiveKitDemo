import React, { useEffect, useState } from "react";
import { Room, createLocalVideoTrack, RoomEvent } from "livekit-client";
import axios from "axios";

const SERVER_URL = "http://192.168.31.4:5000"; // Your Node.js backend

const LiveKitRoom = ({ roomName, userId }) => {
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const joinRoom = async () => {
      try {
        const res = await axios.post(`${SERVER_URL}/get-token`, {
          room: roomName,
          userId,
        });
        const { token, livekitUrl } = res.data;

        const roomInstance = new Room();
        await roomInstance.connect(livekitUrl, token);
        setRoom(roomInstance);

        // ✅ Use correct function for video track
        const videoTrack = await createLocalVideoTrack();
        await roomInstance.localParticipant.publishTrack(videoTrack);

        // Listen for messages
        roomInstance.on(RoomEvent.DataReceived, (data, participant) => {
          const message = JSON.parse(new TextDecoder().decode(data));
          setMessages((prev) => [
            ...prev,
            { sender: participant.identity, text: message.text },
          ]);
        });
      } catch (error) {
        console.error("Error connecting to LiveKit:", error);
      }
    };

    joinRoom();

    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [roomName, userId]);

  const sendMessage = () => {
    if (room && newMessage) {
      const messageData = { text: newMessage };
      room.localParticipant.publishData(JSON.stringify(messageData), "chat");
      setMessages((prev) => [...prev, { sender: "You", text: newMessage }]);
      setNewMessage("");
    }
  };

  return (
    <div>
      <h2>Live Streaming Room: {roomName}</h2>
      <video
        autoPlay
        playsInline
        ref={(el) => {
          if (!el || !room?.localParticipant?.videoTracks) return;
          
          const tracks = Array.from(room.localParticipant.videoTracks.values());
          const videoTrack = tracks[0]?.track;
          if (videoTrack) videoTrack.attach(el);
        }}
      />

      <div>
        <h3>Chat</h3>
        <div>
          {messages.map((msg, index) => (
            <p key={index}>
              <strong>{msg.sender}:</strong> {msg.text}
            </p>
          ))}
        </div>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default LiveKitRoom;
