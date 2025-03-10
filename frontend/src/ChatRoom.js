import React, { useEffect, useState } from "react";
import { Room, RoomEvent } from "livekit-client";
import axios from "axios";

const SERVER_URL = "http://localhost:3000"; // Your backend URL

const ChatRoom = ({ roomName, userId }) => {
    const [room, setRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        const joinRoom = async () => {
            try {
                const res = await axios.post(`${SERVER_URL}/get-token`, { room: roomName, userId });
                const { token, livekitUrl } = res.data;

                const roomInstance = new Room();
                await roomInstance.connect(livekitUrl, token);
                setRoom(roomInstance);

                roomInstance.on(RoomEvent.DataReceived, (data, participant) => {
                    const message = JSON.parse(new TextDecoder().decode(data));
                    setMessages((prev) => [...prev, { sender: participant.identity, text: message.text }]);
                });

            } catch (error) {
                console.error("Error connecting to LiveKit:", error);
            }
        };

        joinRoom();

        return () => {
            if (room) room.disconnect();
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
            <h2>Chat Room: {roomName}</h2>
            
            <div style={{ border: "1px solid black", padding: "10px", height: "300px", overflowY: "auto" }}>
                {messages.map((msg, index) => (
                    <p key={index}><strong>{msg.sender}:</strong> {msg.text}</p>
                ))}
            </div>

            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};

export default ChatRoom;
