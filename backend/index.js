const express = require("express");
require("dotenv").config();
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth.js");
const listingRoutes = require("./routes/listing.js");
const bookingRoutes = require("./routes/booking.js");
const userRoutes = require("./routes/user.js");
const reviewRoutes = require("./routes/review");

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://stayhub-frontend-pscd.onrender.com",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.static("public"));

app.use("/uploads", express.static("public/uploads"));


/* ROUTES */
app.use("/auth", authRoutes)
app.use("/properties", listingRoutes)
app.use("/bookings", bookingRoutes)
app.use("/users", userRoutes)
app.use("/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.send("StayHub backend is running");
});

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 3001;

mongoose
  .connect(process.env.MONGO_URL, { dbName: "StayHub" })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB error:", err));
