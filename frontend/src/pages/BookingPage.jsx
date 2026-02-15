import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchEventById, bookEvent } from "../api";

export default function BookingPage() {
  const { eventId } = useParams(); // ✅ SAME NAME AS ROUTE
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState(1);
  const navigate = useNavigate();

  const [failedImages, setFailedImages] = useState(new Set());
  const [bookingMessage, setBookingMessage] = useState({ text: "", type: "" }); // New state for booking message

  const API_BASE_URL = "http://localhost:8080/api";
  const BACKEND_URL = "http://localhost:8080";

  useEffect(() => {
    const load = async () => {
      const res = await fetchEventById(eventId); // ✅
      setEvent(res.data);
    };
    load();
  }, [eventId]);

  const handleBooking = async () => {
    try {
      await bookEvent(eventId, tickets); // ✅
      setBookingMessage({
        text: "Your Booking is done ✅",
        type: "success",
      });

      // Optional: Navigate after delay
      setTimeout(() => {
        navigate("/user");
      }, 4000);
    } catch {
      setBookingMessage({
        text: "Booking failed ❌",
        type: "error",
      });
    }
  };

  const handleClose = () => {
    navigate("/user");
  };

  if (!event) return <p>Loading...</p>;

  const getImageUrl = (event) => {
    // If this image already failed, return default immediately
    if (failedImages.has(event.id)) {
      return "/images/default-event.jpg";
    }

    if (!event.imageUrl) {
      return "/images/default-event.jpg";
    }

    // If URL is already full (http)
    if (event.imageUrl.startsWith("http")) {
      return event.imageUrl;
    }

    // Construct backend URL
    const cleanImageUrl = event.imageUrl.startsWith("/")
      ? event.imageUrl
      : "/" + event.imageUrl;
    return `${BACKEND_URL}${cleanImageUrl}`;
  };

  // ✅ Handle image error
  const handleImageError = (eventId) => {
    console.log("Image failed for event:", eventId);
    // Mark this image as failed
    setFailedImages((prev) => new Set([...prev, eventId]));
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-black relative">
      {/* Booking Message Display - Fixed at top */}
      {bookingMessage.text && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg text-center font-semibold ${
            bookingMessage.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {bookingMessage.text}
        </div>
      )}

      <div
        className="p-5 rounded-lg shadow-lg"
        style={{
          background:
            "linear-gradient(180deg, #ff0057 0%, #ff7a00 50%, #ffd000 100%)",
        }}
      >
        <div className="bg-black p-6 rounded shadow w-1/2 relative w-96">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full text-gray-600 hover:text-gray-800 text-xl font-bold"
            aria-label="Close"
          >
            ×
          </button>

          <img
            src={getImageUrl(event)}
            alt={event.name}
            className="event-image top-1 w-full h-48 object-cover rounded"
            loading="lazy"
            onError={() => handleImageError(event.id)}
          />
          <h2 className="text-white text-2xl font-bold mt-4">{event.name}</h2>
          <p className="text-white">Artist: {event.artist}</p>
          <p className="text-white">Location: {event.location}</p>
          <p className="text-white">
            Date: {event.date} | Time: {event.time} {event.amPm}
          </p>
          <input
            type="number"
            min="1"
            value={tickets}
            onChange={(e) => setTickets(Number(e.target.value))}
            className="p-2 w-full mt-4 bg-gray-600 text-white rounded"
          />
          <button
            onClick={handleBooking}
            className="bg-green-700 text-white w-full mt-4 p-2 rounded hover:bg-green-600 transition-colors"
          >
            Book
          </button>
        </div>
      </div>
    </div>
  );
}
