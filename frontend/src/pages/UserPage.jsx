import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./UserPage.css";

const UserPage = ({ logout }) => {
  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // ✅ Track failed images to prevent loop
  const [failedImages, setFailedImages] = useState(new Set());

  const navigate = useNavigate();
  const API_BASE_URL = "http://localhost:8080/api";
  const BACKEND_URL = "http://localhost:8080";

  useEffect(() => {
    loadEvents(currentPage);
  }, [currentPage]);

  const loadEvents = async (page) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/events/page/${page}`);
      console.log("Events loaded:", response.data);
      setEvents(response.data.events || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalItems(response.data.totalItems || 0);
      setHasNext(response.data.hasNext || false);
      setHasPrevious(response.data.hasPrevious || false);

      // Reset failed images when new events load
      setFailedImages(new Set());
    } catch (error) {
      console.error("Error loading events:", error);
      if (page === 1) {
        try {
          const fallbackResponse = await axios.get(`${API_BASE_URL}/events`);
          setEvents(fallbackResponse.data);
          setTotalItems(fallbackResponse.data.length);
          setTotalPages(1);
          setHasNext(false);
          setHasPrevious(false);
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
          alert("Failed to load events. Please try again.");
        }
      } else {
        setCurrentPage(1);
      }
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToNextPage = () => {
    if (hasNext) {
      goToPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (hasPrevious) {
      goToPage(currentPage - 1);
    }
  };

  const handleBookNow = (eventId) => {
    navigate(`/book/${eventId}`);
  };

  const goToMyBookings = () => {
    navigate("/my-bookings");
  };

  // ✅ FIXED: Get image URL with fallback
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

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation - Updated with Contact Us button */}
      <nav className="bg-black text-white p-3 flex justify-between items-center">
        {/* Left side - Logo with gradient background */}
        <div
          className="flex items-center px-1 py-1 rounded-lg"
          style={{
            background:
              "linear-gradient(180deg, #ffd000 0%, #ff7a00 50%, #ff0057 100%)",
          }}
        >
          <div className="bg-black bg-opacity-60 rounded-lg px-4 py-1">
            <h1 className="text-2xl font-bold"> Nebula 🎫 </h1>
          </div>
        </div>

        {/* Center - Tagline */}
        <div className="ml-1">
          <h1 className="text-gray-300 text-sm sm:text-base">
            Discover Your Next Experience
          </h1>
        </div>

        {/* Right side - Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={goToMyBookings}
            className="px-5 py-2 rounded-lg font-medium text-white"
            style={{
              background:
                "linear-gradient(90deg, #ff0057 0%, #ff7a00 50%, #ffd000 100%)",
            }}
          >
            My Bookings
          </button>
          <button
            onClick={logout}
            className="px-5 py-2 rounded-lg font-medium text-white"
            style={{ background: "#ff0057" }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Gradient Bar Below Navigation */}
      <div
        className="w-full h-1"
        style={{
          background:
            "linear-gradient(90deg, #ff0057 0%, #ff7a00 50%, #ffd000 100%)",
        }}
      ></div>

      <div
        className=" w-full h-7"
        style={{
          background:
            "linear-gradient(90deg, #ff0057 0%, #ff7a00 50%, #ffd000 100%)",
        }}
      ></div>

      {/* Main Content */}
      <div className="user-content">
        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading amazing events for you...</p>
          </div>
        )}

        {!loading && (
          <>
            {events.length > 0 ? (
              <>
                {/* Events Grid - 8 cards */}
                <div className="events-grid">
                  {events.map((event) => (
                    <div key={event.id} className="event-card">
                      {/* ✅ FIXED: Image with error handling */}
                      <img
                        src={getImageUrl(event)}
                        alt={event.name}
                        className="event-image"
                        loading="lazy"
                        onError={() => handleImageError(event.id)}
                      />
                      <div className="event-details">
                        <h3 className="event-name">{event.name}</h3>
                        <p className="event-artist">
                          <span className="icon">🎤</span>{" "}
                          {event.artist || "TBA"}
                        </p>
                        <p className="event-location">
                          <span className="icon">📍</span> {event.location}
                        </p>
                        <div className="event-datetime">
                          <span className="event-date">
                            <span className="icon">📅</span> {event.date}
                          </span>
                          <span className="event-time">
                            <span className="icon">⏰</span> {event.time}
                          </span>
                        </div>
                        <button
                          onClick={() => handleBookNow(event.id)}
                          className="book-now-btn"
                        >
                          Get Passes
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Section */}
                {(totalPages > 1 || hasPrevious || hasNext) && (
                  <div className="pagination-section bg-black">
                    <div className="page-info text-white display flex justify-center items-center mb-4 p-2">
                      Page {currentPage} of {totalPages} • {totalItems} total
                      events
                    </div>

                    <div className="pagination display flex justify-center space-x-2 items-center p-2 h-14">
                      <button
                        onClick={goToPreviousPage}
                        disabled={!hasPrevious}
                        className="pagination-btn prev"
                      >
                        ← Prev
                      </button>

                      <div className="page-numbers">
                        {getPageNumbers().map((pageNum, index) =>
                          pageNum === "..." ? (
                            <span key={`dots-${index}`} className="page-dots">
                              ...
                            </span>
                          ) : (
                            <button
                              key={pageNum}
                              onClick={() => goToPage(pageNum)}
                              className={`page-number ${currentPage === pageNum ? "active" : ""}`}
                            >
                              {pageNum}
                            </button>
                          ),
                        )}
                      </div>

                      <button
                        onClick={goToNextPage}
                        disabled={!hasNext}
                        className="pagination-btn next"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="no-events">
                <p>No events found. Please check back later.</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="w-full">
        {/* Gradient bar */}
        <div
          className="w-full h-7 block"
          style={{
            background:
              "linear-gradient(90deg, #ff0057 0%, #ff7a00 50%, #ffd000 100%)",
          }}
        />

        {/* Footer */}
        <footer className="bg-black text-white w-full p-4 m-0 leading-none text-center">
          <p className="m-0">© 2026 EventHub. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default UserPage;
