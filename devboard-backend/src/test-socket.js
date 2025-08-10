import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

// Join a board room
const boardId = "50226613-6d51-4a1b-bb58-e661a12f6489"; // Replace with an existing board's ID
socket.emit("joinBoard", boardId);

socket.on("connect", () => {
  console.log("Connected to server:", socket.id);

  // Send a test message
  socket.emit("sendMessage", {
    content: "Hello from test client!",
    boardId,
    senderId: "f2b467a3-88ef-442d-8417-ab800f1620dc" // Replace with an existing user ID
  });
});

// Listen for new messages
socket.on("newMessage", (msg) => {
  console.log("📩 New message received:", msg);
});
