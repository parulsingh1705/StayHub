const express = require("express");
const router = express.Router();

// simple AI-like generator (no API needed)
router.post("/generate-description", async (req, res) => {
  try {
    const { title, location, price } = req.body;

    if (!title || !location) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const description = `Welcome to ${title} located in ${location}. 
This beautiful stay offers comfort, modern amenities, and a relaxing environment.

Perfect for travelers looking for a peaceful getaway, this property provides great value at just ₹${price} per night.

Enjoy your stay with top-class facilities and a memorable experience!`;

    return res.status(200).json({ description });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to generate description" });
  }
});

module.exports = router;