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

app.use(express.static(path.join(__dirname, "../Frontend")));

const io = new Server(server);

io.on("connectin", (socket) => {
  console.log("a user connected");
});
