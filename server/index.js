const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDb = require("./config/connectDb");
const router = require("./routes/index");

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

const PORT = process.env.PORT || 8000;

// Api endpoints

app.use("/api", router);

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log("server is running on " + PORT);
  });
});
