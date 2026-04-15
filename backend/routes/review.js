const express = require("express");
const router = express.Router();
const Review = require("../models/Review");

// CREATE OR UPDATE REVIEW
router.post("/", async (req, res) => {
  try {
    const { userId, listingId, rating, comment } = req.body;

    if (!userId || !listingId || !rating || !comment) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingReview = await Review.findOne({ userId, listingId });

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment;
      await existingReview.save();

      const updatedReview = await Review.findById(existingReview._id).populate(
        "userId",
        "firstName lastName profileImagePath"
      );

      return res.status(200).json({
        message: "Review updated successfully",
        review: updatedReview,
      });
    }

    const newReview = new Review({
      userId,
      listingId,
      rating,
      comment,
    });

    await newReview.save();

    const populatedReview = await Review.findById(newReview._id).populate(
      "userId",
      "firstName lastName profileImagePath"
    );

    return res.status(201).json({
      message: "Review added successfully",
      review: populatedReview,
    });
  } catch (err) {
    console.log("Review POST error:", err);
    return res.status(500).json({
      message: err.message || "Failed to create review",
    });
  }
});

// GET REVIEWS BY LISTING
router.get("/:listingId", async (req, res) => {
  try {
    const reviews = await Review.find({
      listingId: req.params.listingId,
    })
      .populate("userId", "firstName lastName profileImagePath")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;

    const avgRating =
      totalReviews === 0
        ? 0
        : reviews.reduce((sum, item) => sum + Number(item.rating), 0) / totalReviews;

    return res.status(200).json({
      reviews,
      totalReviews,
      avgRating: Number(avgRating.toFixed(1)),
    });
  } catch (err) {
    console.log("Review GET error:", err);
    return res.status(500).json({
      message: err.message || "Failed to fetch reviews",
    });
  }
});

// DELETE REVIEW
router.delete("/:reviewId", async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userId } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.userId.toString() !== userId) {
      return res.status(403).json({ message: "You can delete only your own review" });
    }

    await Review.findByIdAndDelete(reviewId);

    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    console.log("Review DELETE error:", err);
    return res.status(500).json({
      message: err.message || "Failed to delete review",
    });
  }
});

module.exports = router;