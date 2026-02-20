import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchEventById, bookEvent, handleApiError } from "../api";

// Constants
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
const DEFAULT_IMAGE = `${BACKEND_URL}/uploads/events/default-event.jpg`;

export default function BookingPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState(1);
  const [loading, setLoading] = useState(true);
  const [bookingState, setBookingState] = useState({
    loading: false,
    message: { text: "", type: "" },
  });
  const [imageError, setImageError] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const response = await fetchEventById(eventId);
      setEvent(response.data);
    } catch {
      setBookingState({
        loading: false,
        message: { text: "Failed to load event details", type: "error" },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    setBookingState({ loading: true, message: { text: "", type: "" } });

    try {
      await bookEvent(eventId, tickets);
      setBookingState({
        loading: false,
        message: { text: "Booking successful! ✅", type: "success" },
      });

      // Redirect after 2 seconds
      setTimeout(() => navigate("/my-bookings"), 2000);
    } catch (error) {
      setBookingState({
        loading: false,
        message: { text: handleApiError(error), type: "error" },
      });
    }
  };

  const getImageUrl = () => {
    if (imageError || !event?.imageUrl) return DEFAULT_IMAGE;

    try {
      if (event.imageUrl.startsWith("http")) return event.imageUrl;
      if (event.imageUrl.startsWith("/")) {
        return `${BACKEND_URL}${event.imageUrl}`;
      }
      return `${BACKEND_URL}/uploads/events/${event.imageUrl}`;
    } catch {
      return DEFAULT_IMAGE;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl mb-4">Event not found</p>
          <button
            onClick={() => navigate("/user")}
            className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Navigation */}
      <nav className="bg-black text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="bg-gradient-to-b from-yellow-400 via-orange-500 to-pink-600 p-px rounded-lg">
            <div className="bg-black bg-opacity-60 rounded-lg px-4 py-2">
              <h1 className="text-2xl font-bold">Nebula 🎫</h1>
            </div>
          </div>
          <button
            onClick={() => navigate("/user")}
            className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
          >
            Home
          </button>
        </div>
      </nav>

      <div className="h-3 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400"></div>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Message */}
          {bookingState.message.text && (
            <div
              className={`mb-4 p-4 rounded-lg text-center ${
                bookingState.message.type === "success"
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              {bookingState.message.text}
            </div>
          )}

          {/* Booking Card */}
          <div className="bg-gradient-to-b from-pink-600 via-orange-500 to-yellow-400 p-1 rounded-2xl">
            <div className="bg-black rounded-2xl p-6">
              {/* Close Button */}
              <button
                onClick={() => navigate("/user")}
                className="float-right text-gray-400 hover:text-white text-2xl"
                aria-label="Close"
              >
                ×
              </button>

              {/* Event Image */}
              <img
                src={getImageUrl()}
                alt={event.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
                onError={() => setImageError(true)}
              />

              {/* Event Details */}
              <h2 className="text-white text-2xl font-bold mb-2">
                {event.name}
              </h2>
              <div className="space-y-2 text-gray-300 mb-6">
                <p>🎤 Artist: {event.artist}</p>
                <p>📍 Location: {event.location}</p>
                <p>
                  📅 Date: {event.date} at {event.time}
                </p>
              </div>

              {/* Ticket Input */}
              <div className="mb-6">
                <label className="block text-white mb-2">
                  Number of Tickets
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tickets}
                  onChange={(e) =>
                    setTickets(
                      Math.min(10, Math.max(1, parseInt(e.target.value) || 1)),
                    )
                  }
                  className="w-full p-3 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-yellow-500"
                />
                <p className="text-gray-300 text-sm mt-1">
                  Maximum 10 tickets per booking
                </p>
              </div>

              {/* Book Button */}
              <button
                onClick={handleBooking}
                disabled={bookingState.loading}
                className={`w-full py-3 rounded-lg font-bold text-lg text-white transition ${
                  bookingState.loading
                    ? "bg-gray-700 cursor-not-allowed"
                    : "bg-green-700 hover:bg-green-800"
                }`}
              >
                {bookingState.loading ? "Processing..." : "Confirm Booking"}
              </button>

              {/* Price Info */}
              <p className="text-gray-400 text-sm text-center mt-4">
                Tickets are free • No payment required
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto">
        <div className="h-3 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400"></div>
        <footer className="bg-black text-white py-6 text-center">
          <p className="text-gray-400">© 2026 Nebula. All rights reserved.</p>
          <p className="text-gray-500 text-sm mt-2">
            Nebula - Discover Your Next Experience
          </p>
        </footer>
      </div>
    </div>
  );
}
