require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { AccessToken } = require("livekit-server-sdk");
const fs = require("fs");
const path = require("path");
const WebSocketServer = require("ws").Server;

const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);
app.use(express.json());

const livekitApiKey = process.env.LIVEKIT_API_KEY;
const livekitApiSecret = process.env.LIVEKIT_API_SECRET;
const livekitHost = process.env.LIVEKIT_URL; // "wss://your-livekit-server"

app.post("/get-token", async (req, res) => {
  const { room, userId } = req.body;
  try {
    if (!room || !userId) {
      return res.status(400).json({ error: "Room and userId are required" });
    }

    const token = new AccessToken(livekitApiKey, livekitApiSecret, {
      identity: userId,
    });

    token.addGrant({
      roomJoin: true,
      room,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    res.json({ token: await token.toJwt(), livekitUrl: livekitHost });
  } catch (error) {
    console.error("Error generating token:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

app.post("/access-token", async (req, res) => {
  try {
    const { roomName, identity } = req.body;
    const at = new AccessToken(livekitApiKey, livekitApiSecret, {
      identity,
    });
    at.addGrant({ roomJoin: true, room: roomName });
    res.json({ accessToken:await at.toJwt() });
  } catch (error) {
    console.error("Error generating token:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

// Recording and Chat storage variables
let recordings = {};
let chatLogs = {};
let port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// websocket server for chat.
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const data = JSON.parse(message);
    const room = data.room;
    if (!chatLogs[room]) {
      chatLogs[room] = [];
    }
    chatLogs[room].push({ user: data.user, message: data.message });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocketServer.OPEN) {
        client.send(
          JSON.stringify({ room: room, user: data.user, message: data.message })
        );
      }
    });
  });
});

// Recording Logic, (example, it is better to use livekit server side recording)
app.post("/start-recording", (req, res) => {
  const { roomName } = req.body;
  recordings[roomName] = { startTime: new Date() };
  res.send("Recording started");
});

app.post("/stop-recording", (req, res) => {
  const { roomName } = req.body;
  if (recordings[roomName]) {
    recordings[roomName].endTime = new Date();
    //save data to disk.
    fs.writeFileSync(
      `./recordings/${roomName}.json`,
      JSON.stringify(recordings[roomName])
    );
    fs.writeFileSync(
      `./chatlogs/${roomName}.json`,
      JSON.stringify(chatLogs[roomName] || [])
    );
    delete recordings[roomName];
    delete chatLogs[roomName];
    res.send("recording stopped");
  } else {
    res.status(400).send("No recording to stop");
  }
});

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
