const router = require("express").Router();
const mongoose = require("mongoose");
const Review = require("../models/Review");

router.post("/", async (req, res) => {
  try {
    const { listingId, userId, rating, comment } = req.body;

    if (!listingId || !userId || !rating || !comment) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(listingId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid listingId or userId" });
    }

    const numericRating = Number(rating);

    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const existingReview = await Review.findOne({ listingId, userId });

    if (existingReview) {
      existingReview.rating = numericRating;
      existingReview.comment = comment;
      await existingReview.save();

      return res.status(200).json({
        message: "Review updated successfully",
        review: existingReview,
      });
    }

    const newReview = new Review({
      listingId,
      userId,
      rating: numericRating,
      comment,
    });

    await newReview.save();

    return res.status(201).json({
      message: "Review added successfully",
      review: newReview,
    });
  } catch (error) {
    console.error("Create review error:", error);
    return res.status(500).json({ message: "Failed to add review" });
  }
});

router.get("/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({ message: "Invalid listingId" });
    }

    const reviews = await Review.find({ listingId })
      .populate("userId", "firstName lastName profileImagePath")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;

    const avgRating =
      totalReviews === 0
        ? 0
        : reviews.reduce((sum, item) => sum + item.rating, 0) / totalReviews;

    return res.status(200).json({
      reviews,
      totalReviews,
      avgRating: Number(avgRating.toFixed(1)),
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    return res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

module.exports = router;