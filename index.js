const express = require("express");
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

app.get("/", (req, res) => res.status(200).json("index.html page"));

app.use(authRoute);
app.use(userRoute);

app.listen(process.env.PORT || 5000, () => {
  console.log("Backend server is running!");
});