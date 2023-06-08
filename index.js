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

io.on("connectin", (socket) => {
  console.log("a user connected");
});
