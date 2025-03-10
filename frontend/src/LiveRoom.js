import React, { useState, useEffect } from "react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import { Container, Card } from "react-bootstrap";
import Chat from "./Chat";
import "@livekit/components-styles";
import "./LiveRoom.css"; // We'll create this file next

const host = "http://192.168.31.4:3000";

const LiveRoom = ({ roomName, identity }) => {
  const [accessToken, setAccessToken] = useState("");
  const [isBroadcaster, setIsBroadcaster] = useState(false);

  useEffect(() => {
    async function getToken() {
      try {
        const response = await fetch(`${host}/access-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomName, identity }),
        });
        const { accessToken } = await response.json();
        setAccessToken(accessToken);
        setIsBroadcaster(identity === "broadcaster");

        if (identity === "broadcaster") {
          await fetch(`${host}/start-recording`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomName: roomName }),
          });
        }
      } catch (error) {
        console.error("Failed to get access token", error);
      }
    }
    getToken();

    return () => {
      if (isBroadcaster) {
        fetch(`${host}/stop-recording`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomName: roomName }),
        });
      }
    };
  }, [roomName, identity]);

  if (!accessToken) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Card className="text-center p-4 shadow">
          <Card.Body>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Connecting to room...</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container fluid className="live-room-container p-0">
      <div className="video-conference-wrapper">
        <LiveKitRoom
          serverUrl="wss://testing-v0f3aik9.livekit.cloud"
          token={accessToken}
          connect={true}
        >
          <VideoConference />
        </LiveKitRoom>
      </div>
      <div className="chat-wrapper">
        <Chat room={roomName} user={identity} />
      </div>
    </Container>
  );
};

export default LiveRoom;
