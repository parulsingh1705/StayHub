import { useEffect, useState } from "react";
import "../styles/ListingDetails.scss";
import { useNavigate, useParams } from "react-router-dom";
import { facilities } from "../data";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import Footer from "../components/Footer";

const ListingDetails = () => {
  const [loading, setLoading] = useState(true);

  const { listingId } = useParams();
  const [listing, setListing] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  let userId = null;

  try {
    const rawData = localStorage.getItem("persist:root");

    if (rawData) {
      const persistedData = JSON.parse(rawData);
      const userData = persistedData?.user ? JSON.parse(persistedData.user) : null;
      userId = userData?._id;
    }
  } catch (error) {
    console.error("User parse error:", error);
  }

  const getListingDetails = async () => {
    try {
      const response = await fetch(
        `https://stayhub-backend-9pns.onrender.com/properties/${listingId}`,
        {
          method: "GET",
        }
      );

      const data = await response.json();
      setListing(data);
      setLoading(false);
    } catch (err) {
      console.log("Fetch Listing Details Failed", err.message);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `https://stayhub-backend-9pns.onrender.com/reviews/${listingId}`
      );
      const data = await response.json();

      setReviews(data.reviews || []);
      setAvgRating(data.avgRating || 0);
      setTotalReviews(data.totalReviews || 0);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
  };

  useEffect(() => {
    getListingDetails();
    fetchReviews();
  }, [listingId]);

  /* BOOKING CALENDAR */
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const handleSelect = (ranges) => {
    setDateRange([ranges.selection]);
  };

  const start = new Date(dateRange[0].startDate);
  const end = new Date(dateRange[0].endDate);
  const dayCount = Math.max(
    1,
    Math.ceil((end - start) / (1000 * 60 * 60 * 24))
  );

  /* SUBMIT BOOKING */
  const customerId = useSelector((state) => state?.user?._id);

  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!customerId) {
      navigate("/login");
      return;
    }

    try {
      const bookingForm = {
        customerId,
        listingId,
        hostId: listing.creator._id,
        startDate: dateRange[0].startDate.toDateString(),
        endDate: dateRange[0].endDate.toDateString(),
        totalPrice: listing.price * dayCount,
      };

      const response = await fetch(
        "https://stayhub-backend-9pns.onrender.com/bookings/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingForm),
        }
      );

      if (response.ok) {
        navigate(`/${customerId}/trips`);
      }
    } catch (err) {
      console.log("Submit Booking Failed.", err.message);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    console.log("userId:", userId);
    console.log("listingId:", listingId);
    console.log("rating:", rating);
    console.log("comment:", comment);

    if (!userId) {
      alert("User ID not found. Please login again.");
      return;
    }

    if (!listingId) {
      alert("Listing ID not found.");
      return;
    }

    if (!comment.trim()) {
      alert("Please enter a comment");
      return;
    }

    try {
      setReviewLoading(true);

      const response = await fetch(
        "https://stayhub-backend-9pns.onrender.com/reviews",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            listingId,
            rating,
            comment,
          }),
        }
      );

      const data = await response.json();
      console.log("Review response:", data);

      if (!response.ok) {
        alert(data.message || "Failed to submit review");
        return;
      }

      alert("Review submitted successfully");
      setComment("");
      setRating(5);
      fetchReviews();
    } catch (error) {
      console.error("Submit review error:", error);
      alert("Something went wrong while submitting review");
    } finally {
      setReviewLoading(false);
    }
  };

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />

      <div className="listing-details">
        <div className="title">
          <h1>{listing.title}</h1>
          <div></div>
        </div>

        <div className="photos">
          {listing?.listingPhotoPaths?.map((photo, index) => (
            <img
              key={index}
              src={`https://stayhub-backend-9pns.onrender.com/${photo.includes("uploads")
                ? photo.replace("public\\", "").replaceAll("\\", "/")
                : `uploads/${photo}`
                }`}
              alt="listing"
            />
          ))}
        </div>

        <h2>
          {listing.type} in {listing.city}, {listing.province}, {listing.country}
        </h2>
        <p>
          {listing.guestCount} guests - {listing.bedroomCount} bedroom(s) -{" "}
          {listing.bedCount} bed(s) - {listing.bathroomCount} bathroom(s)
        </p>
        <hr />

        <div className="profile">
          <img
            src={`https://stayhub-backend-9pns.onrender.com/${listing.creator.profileImagePath.replace(
              "public",
              ""
            )}`}
            alt="Host profile"
          />
          <h3>
            Hosted by {listing.creator.firstName} {listing.creator.lastName}
          </h3>
        </div>
        <hr />

        <h3>Description</h3>
        <p>{listing.description}</p>
        <hr />

        <h3>{listing.highlight}</h3>
        <p>{listing.highlightDesc}</p>
        <hr />

        <div className="booking">
          <div>
            <h2>What this place offers?</h2>
            <div className="amenities">
              {listing?.amenities?.[0]?.split(",")?.map((item, index) => (
                <div className="facility" key={index}>
                  <div className="facility_icon">
                    {
                      facilities.find((facility) => facility.name === item)
                        ?.icon
                    }
                  </div>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2>How long do you want to stay?</h2>
            <div className="date-range-calendar">
              <DateRange ranges={dateRange} onChange={handleSelect} />
              {dayCount > 1 ? (
                <h2>
                  ${listing.price} x {dayCount} nights
                </h2>
              ) : (
                <h2>
                  ${listing.price} x {dayCount} night
                </h2>
              )}

              <h2>Total price: ${listing.price * dayCount}</h2>
              <p>Start Date: {dateRange[0].startDate.toDateString()}</p>
              <p>End Date: {dateRange[0].endDate.toDateString()}</p>

              <button className="button" type="submit" onClick={handleSubmit}>
                BOOKING
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "40px" }}>
          <hr />
          <h2>Reviews & Ratings</h2>

          <p>
            <strong>Average Rating:</strong> {avgRating} / 5
          </p>
          <p>
            <strong>Total Reviews:</strong> {totalReviews}
          </p>

          <form
            onSubmit={handleSubmitReview}
            style={{ marginTop: "20px", marginBottom: "30px" }}
          >
            <div style={{ marginBottom: "10px" }}>
              <label>
                <strong>Rating: </strong>
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </div>

            <div style={{ marginBottom: "10px" }}>
              <textarea
                placeholder="Write your review..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="4"
                style={{ width: "100%", padding: "10px" }}
              />
            </div>

            <button type="submit" className="button" disabled={reviewLoading}>
              {reviewLoading ? "Submitting..." : "Submit Review"}
            </button>
          </form>

          <div>
            {reviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              reviews.map((review) => (
                <div
                  key={review._id}
                  style={{
                    border: "1px solid #ddd",
                    padding: "15px",
                    borderRadius: "10px",
                    marginBottom: "15px",
                  }}
                >
                  <p>
                    <strong>
                      {review.userId?.firstName} {review.userId?.lastName}
                    </strong>
                  </p>
                  <p>
                    <strong>Rating:</strong> {review.rating} / 5
                  </p>
                  <p>{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ListingDetails;