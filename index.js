const express = require("express");
const app = express();
require("dotenv").config();
const { connection } = require("./config/db");
const { userRoute } = require("./routes/user.route");
const path = require("path");

const http = require("http");

const server = http.createServer(app);

const { Server } = require("socket.io");

const cors = require("cors");

app.use(cors());

app.use(express.json());

// basci route
app.get('/', (req, res) => {
  res.send("Welcome to Chat App")
})

app.use("/user", userRoute);

app.listen(process.env.port, async () => {
  try {
    await connection;
    console.log("Connected to DB");
  } catch (error) {
    console.log({ Message: error.message });
  }
  console.log(`Server is running on port ${process.env.port}`);
});



const io = new Server(server);

const members = [];

// Socket.io connection and events
io.on("connection", (socket) => {
  console.log("A user connected");

  // Join the chat room and send member list
  socket.on("join", (username) => {
    const member = {
      id: socket.id,
      username: username,
    };
    members.push(member);
    socket.join("chatroom");
    io.to("chatroom").emit("memberList", members);
  });

  // Listen for chat messages
  socket.on("sendMessage", (message) => {
    const username = getMemberUsername(socket.id);
    const timestamp = new Date().getTime();
    const chatMessage = {
      username: username,
      content: message,
      timestamp: timestamp,
    };
    io.to("chatroom").emit("chatMessage", chatMessage);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected");
    removeMember(socket.id);
    io.to("chatroom").emit("memberList", members);
  });
});

// Get the username of a member by socket ID
function getMemberUsername(socketId) {
  const member = members.find((m) => m.id === socketId);
  return member ? member.username : "";
}

// Remove a member from the member list by socket ID
function removeMember(socketId) {
  const index = members.findIndex((m) => m.id === socketId);
  if (index !== -1) {
    members.splice(index, 1);
  }
}
