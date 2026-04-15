const express = require("express");
const router = express.Router();
const Review = require("../models/Review");

// CREATE REVIEW
router.post("/", async (req, res) => {
  try {
    const { userId, listingId, rating, comment } = req.body;

    const newReview = new Review({
      userId,
      listingId,
      rating,
      comment,
    });

    await newReview.save();

    res.status(200).json(newReview);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create review" });
  }
});

// GET REVIEWS BY LISTING
router.get("/:listingId", async (req, res) => {
  try {
    const reviews = await Review.find({
      listingId: req.params.listingId,
    }).populate("userId", "firstName lastName profileImagePath");

    const totalReviews = reviews.length;

    const avgRating =
      totalReviews === 0
        ? 0
        : reviews.reduce((sum, item) => sum + item.rating, 0) / totalReviews;

    res.status(200).json({
      reviews,
      totalReviews,
      avgRating: Number(avgRating.toFixed(1)),
    });
  } catch (err) {
    console.log("Review GET error:", err);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

module.exports = router;