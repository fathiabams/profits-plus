require("dotenv").config();
const express = require("express");

const jwt = require("jsonwebtoken");
const User = require("./model/user");
const Admin = require("./model/admin");
const socketIO = require("socket.io");
const cors = require("cors");
const corsOption = require("./config/corsOption");

// const io = socketIO();

const app = express();

const connectDB = require("./config/db");
const appRouter = require("./router/operations");

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  next();
});
app.use(cors(corsOption));
connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use("/api/v1", require("./router/operations"));
app.use(appRouter)
app.get("/", (req, res) => {
    res.send("welcome to the default route, if you get this message then it means you have probably set it u, doesnt mean you wont further experience challenge, it just simply means the backend api is up and workinf");
});

const PORT = 3000;
// io.listen(1230, () => {
//   console.log("Socket server started on port 8080");
// });
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT} `);
});
