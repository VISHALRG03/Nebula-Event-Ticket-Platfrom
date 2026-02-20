import { useState, useEffect } from "react";
import { fetchPaginatedEvents } from "../api";
import { useNavigate } from "react-router-dom";
import "./UserPage.css";

// Constants
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
const DEFAULT_IMAGE = `${BACKEND_URL}/uploads/events/default-event.jpg`;

// Get username directly from localStorage (synchronous)
const getInitialUserName = () => {
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return user?.name || "User";
    }
  } catch {
    // Silently fail
  }
  return "User";
};

export default function UserPage({ logout }) {
  const [state, setState] = useState({
    events: [],
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    loading: true,
    hasNext: false,
    hasPrevious: false,
    failedImages: new Set(),
  });

  // Initialize userName directly - NO useEffect needed!
  const [userName] = useState(getInitialUserName);

  const navigate = useNavigate();

  // Load events when page changes
  useEffect(() => {
    let isMounted = true;

    const loadEvents = async () => {
      setState((prev) => ({ ...prev, loading: true }));

      try {
        const response = await fetchPaginatedEvents(state.currentPage);
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            events: response.data.events || [],
            totalPages: response.data.totalPages || 1,
            totalItems: response.data.totalItems || 0,
            hasNext: response.data.hasNext || false,
            hasPrevious: response.data.hasPrevious || false,
            loading: false,
            failedImages: new Set(),
          }));
        }
      } catch {
        if (isMounted) {
          setState((prev) => ({ ...prev, events: [], loading: false }));
        }
      }
    };

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, [state.currentPage]);

  const getImageUrl = (event) => {
    if (state.failedImages.has(event.id)) return DEFAULT_IMAGE;
    if (!event.imageUrl) return DEFAULT_IMAGE;

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

  const handleImageError = (eventId) => {
    setState((prev) => ({
      ...prev,
      failedImages: new Set([...prev.failedImages, eventId]),
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= state.totalPages) {
      setState((prev) => ({ ...prev, currentPage: newPage }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBookNow = (eventId) => navigate(`/book/${eventId}`);
  const handleMyBookings = () => navigate("/my-bookings");

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];

    for (let i = 1; i <= state.totalPages; i++) {
      if (
        i === 1 ||
        i === state.totalPages ||
        (i >= state.currentPage - delta && i <= state.currentPage + delta)
      ) {
        range.push(i);
      }
    }

    return range.reduce((acc, curr, idx, arr) => {
      if (idx > 0 && curr - arr[idx - 1] > 1) {
        acc.push("...");
      }
      acc.push(curr);
      return acc;
    }, []);
  };

  if (state.loading && state.events.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent mx-auto"></div>
          <p className="text-white mt-4">Loading amazing events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="bg-black text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="bg-gradient-to-b from-yellow-400 via-orange-500 to-pink-600 p-px rounded-lg">
            <div className="bg-black bg-opacity-60 rounded-lg px-4 py-2">
              <h1 className="text-2xl font-bold">Nebula 🎫</h1>
            </div>
          </div>

          <div className="hidden md:block">
            <p className="text-gray-300">Welcome, {userName + " !"}</p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleMyBookings}
              className="px-6 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 hover:opacity-90 transition"
            >
              My Bookings
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Gradient Bar */}
      <div className="h-3 bg-gradient-to-r from-red-700 via-orange-600 to-yellow-500"></div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 ">
        {state.events.length === 0 && !state.loading ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-xl">
              No events available at the moment
            </p>
          </div>
        ) : (
          <>
            {/* Events Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {state.events.map((event) => (
                <div
                  key={event.id}
                  className="bg-black rounded-lg overflow-hidden hover:transform hover:scale-105 transition duration-300 border-2 border-gray-600"
                >
                  <img
                    src={getImageUrl(event)}
                    alt={event.name}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                    onError={() => handleImageError(event.id)}
                  />
                  <div className="p-4">
                    <h3 className="text-white font-bold text-lg mb-2 truncate">
                      {event.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-1">
                      <span className="mr-2">🎤</span> {event.artist || "TBA"}
                    </p>
                    <p className="text-gray-400 text-sm mb-1">
                      <span className="mr-2">📍</span> {event.location}
                    </p>
                    <p className="text-gray-400 text-sm mb-3">
                      <span className="mr-2">📅</span> {event.date} at{" "}
                      {event.time}
                    </p>
                    <button
                      onClick={() => handleBookNow(event.id)}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition"
                    >
                      Get Tickets
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {state.totalPages > 1 && (
              <div className="mt-8">
                <p className="text-center text-gray-400 mb-4">
                  Page {state.currentPage} of {state.totalPages} •{" "}
                  {state.totalItems} events
                </p>

                <div className="flex justify-center items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(state.currentPage - 1)}
                    disabled={!state.hasPrevious}
                    className={`px-4 py-2 rounded-lg transition ${
                      state.hasPrevious
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-700 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    ← Previous
                  </button>

                  {/* Desktop Page Numbers */}
                  <div className="hidden md:flex space-x-2">
                    {getPageNumbers().map((page, index) =>
                      page === "..." ? (
                        <span
                          key={`dots-${index}`}
                          className="px-3 py-2 text-gray-400"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 rounded-lg transition ${
                            state.currentPage === page
                              ? "bg-yellow-500 text-white"
                              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                    )}
                  </div>

                  {/* Mobile Page Indicator */}
                  <span className="md:hidden text-white">
                    {state.currentPage} / {state.totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(state.currentPage + 1)}
                    disabled={!state.hasNext}
                    className={`px-4 py-2 rounded-lg transition ${
                      state.hasNext
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-700 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12">
        <div className="h-3 bg-gradient-to-r from-red-700 via-orange-600 to-yellow-500"></div>
        <footer className="bg-black text-white py-6 text-center">
          <p className="text-gray-400">© 2026 Nebula. All rights reserved.</p>
          <p className="text-gray-500 text-sm mt-2">
            Discover Your Next Experience
          </p>
        </footer>
      </div>
    </div>
  );
}
