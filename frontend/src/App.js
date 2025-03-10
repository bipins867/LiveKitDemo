import React, { useState } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import LiveRoom from './LiveRoom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [roomName, setRoomName] = useState('');
  const [identity, setIdentity] = useState('');
  const [inRoom, setInRoom] = useState(false);

  const handleJoinRoom = () => {
    if (roomName && identity) {
      setInRoom(true);
    }
  };

  if (inRoom) {
    return <LiveRoom roomName={roomName} identity={identity} />;
  }

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Card className="join-room-card shadow">
        <Card.Body>
          <Card.Title className="text-center mb-4">
            <h2>Join Live Stream</h2>
          </Card.Title>
          <Form>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="Room Name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Control
                type="text"
                placeholder="Your Name (identity)"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
              />
            </Form.Group>
            <div className="d-grid">
              <Button 
                variant="primary" 
                size="lg"
                onClick={handleJoinRoom}
                disabled={!roomName || !identity}
              >
                Join Room
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default App;