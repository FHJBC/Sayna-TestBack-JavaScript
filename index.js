const express = require("express");
const moment = require("moment");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");

const app = express();

dotenv.config();

// const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB Connection Successfull!"))
  .catch((err) => {
    console.log(err);
  });

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);

const MAX_ATTEMPTS = 3; // after which the account should be locked
const LOCK_WINDOW = 2; // in minutes

let lock = {
  attempts: 0,
  isLocked: false,
  unlocksAt: null,
};

let locks = {};

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        error: true,
        message: "Please enter email and password to continue",
        status: 400,
      });
    }
    if (
      locks[email] &&
      locks[email].isLocked &&
      locks[email].unlocksAt > new Date()
    )
      return res.status(401).json({
        error: true,
        message:
          "Account locked due to many invalid attempts. You account unlocks " +
          moment(locks[email].unlocksAt).fromNow(),
      });

    // Not recommended ^^
    const isValid = email == "test@gmail.com" && password == "complex_password";

    //If the login attempt is invalid
    if (!isValid) {
      locks[email] = lock;
      locks[email].attempts += 1;
      if (locks[email].attempts >= MAX_ATTEMPTS) {
        var d = new Date();
        d.setMinutes(d.getMinutes() + LOCK_WINDOW);
        locks[email].isLocked = true;
        locks[email].unlocksAt = d;
      }
      return res.status(401).json({
        error: true,
        message:
          "Sorry, please check whether you have entered the correct credentials.",
      });
    }

    delete locks[email];

    return res.send("Authentication success");
  } catch (err) {
    console.error("Login error", err);
    return res.status(500).json({
      error: true,
      message:
        "Sorry, couldn't process your request right now. Please try again later.",
    });
  }
});

// Returns all the locks -for testing purpose
app.get("/locks", async (req, res) => {
  try {
    return res.send(locks);
  } catch (error) {
    return res.status(500);
  }
});

// app.listen(PORT, () => console.log("Server started!"));

app.listen(process.env.PORT || 5000, () => {
  console.log("Backend server is running!");
});