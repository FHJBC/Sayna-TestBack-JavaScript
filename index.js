const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const path = require("path");


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
app.use(express.static(path.join(__dirname, 'views')));

app.get('/', function (req, res) {
  res.render("index.html");
})

app.use(authRoute);
app.use(userRoute);

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
  res.render("404.html");
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Backend server is running!");
});