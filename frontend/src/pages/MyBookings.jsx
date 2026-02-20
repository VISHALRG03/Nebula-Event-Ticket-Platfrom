import { useEffect, useState } from "react"; // Removed useCallback
import {
  fetchUserBookings,
  deleteBooking,
  generateQrForBooking,
  fetchTicketsByBooking,
  checkTicketStatus,
  handleApiError,
} from "../api";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

// Sort bookings: active first, completed last
const sortBookings = (bookings) => {
  return [...bookings].sort((a, b) => {
    const aUsed = a.ticketsUsed || 0;
    const bUsed = b.ticketsUsed || 0;
    const aCompleted = aUsed === a.totalTickets;
    const bCompleted = bUsed === b.totalTickets;

    if (aCompleted && !bCompleted) return 1;
    if (!aCompleted && bCompleted) return -1;
    return new Date(b.event.date) - new Date(a.event.date);
  });
};

export default function MyBookings() {
  const [state, setState] = useState({
    bookings: [],
    loading: true,
    message: { text: "", type: "", bookingId: null },
  });

  const [qrState, setQrState] = useState({
    data: null,
    bookingId: null,
    expandedId: null,
  });

  const [scanNotification, setScanNotification] = useState(null);
  const [pollingActive, setPollingActive] = useState(false);

  const navigate = useNavigate();

  // Load bookings on mount
  useEffect(() => {
    loadBookings();
  }, []);

  // Polling effect
  useEffect(() => {
    if (!pollingActive || !qrState.bookingId) return;

    let intervalId = setInterval(async () => {
      try {
        const response = await checkTicketStatus(qrState.bookingId);

        if (response.data.anyTicketScanned) {
          setScanNotification({
            show: true,
            eventName: response.data.eventName,
            scannedCount: response.data.scannedTickets,
            totalTickets: response.data.totalTickets,
            time: new Date().toLocaleTimeString(),
          });

          // Auto-hide after 5 seconds
          setTimeout(() => setScanNotification(null), 5000);

          // Refresh bookings
          loadBookings();

          // Stop polling if all tickets scanned
          if (response.data.scannedTickets === response.data.totalTickets) {
            setPollingActive(false);
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [pollingActive, qrState.bookingId]);

  const loadBookings = async () => {
    try {
      const response = await fetchUserBookings();
      const bookings = Array.isArray(response.data) ? response.data : [];
      setState((prev) => ({
        ...prev,
        bookings: sortBookings(bookings),
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        bookings: [],
        loading: false,
        message: {
          text: handleApiError(error),
          type: "error",
          bookingId: null,
        },
      }));
    }
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) return;

    try {
      await deleteBooking(bookingId);
      setState((prev) => ({
        ...prev,
        bookings: prev.bookings.filter((b) => b.id !== bookingId),
        message: {
          text: "Booking cancelled successfully",
          type: "success",
          bookingId,
        },
      }));
      setTimeout(
        () =>
          setState((prev) => ({
            ...prev,
            message: { text: "", type: "", bookingId: null },
          })),
        3000,
      );
    } catch (error) {
      setState((prev) => ({
        ...prev,
        message: { text: handleApiError(error), type: "error", bookingId },
      }));
      setTimeout(
        () =>
          setState((prev) => ({
            ...prev,
            message: { text: "", type: "", bookingId: null },
          })),
        3000,
      );
    }
  };

  const handleGenerateQr = async (bookingId) => {
    try {
      const response = await generateQrForBooking(bookingId);
      setQrState({
        data: response.data.qrCodes,
        bookingId,
        expandedId: bookingId,
      });
      setPollingActive(true);
      setState((prev) => ({
        ...prev,
        message: { text: "QR Codes generated!", type: "success", bookingId },
      }));
      setTimeout(
        () =>
          setState((prev) => ({
            ...prev,
            message: { text: "", type: "", bookingId: null },
          })),
        3000,
      );
      loadBookings(); // Refresh to update qrGenerated status
    } catch (error) {
      setState((prev) => ({
        ...prev,
        message: { text: handleApiError(error), type: "error", bookingId },
      }));
      setTimeout(
        () =>
          setState((prev) => ({
            ...prev,
            message: { text: "", type: "", bookingId: null },
          })),
        3000,
      );
    }
  };

  const handleViewQr = async (bookingId) => {
    try {
      const response = await fetchTicketsByBooking(bookingId);
      setQrState({
        data: response.data.map((ticket) => ticket.qrCode),
        bookingId,
        expandedId: bookingId,
      });
      setPollingActive(true);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        message: { text: handleApiError(error), type: "error", bookingId },
      }));
      setTimeout(
        () =>
          setState((prev) => ({
            ...prev,
            message: { text: "", type: "", bookingId: null },
          })),
        3000,
      );
    }
  };

  const handleCloseQr = () => {
    setQrState({ data: null, bookingId: null, expandedId: null });
    setPollingActive(false);
  };

  const handleRemoveCompleted = async (bookingId) => {
    if (!window.confirm("Remove this completed booking from your list?"))
      return;

    try {
      await deleteBooking(bookingId);
      setState((prev) => ({
        ...prev,
        bookings: prev.bookings.filter((b) => b.id !== bookingId),
        message: { text: "Booking removed", type: "success", bookingId },
      }));
      setTimeout(
        () =>
          setState((prev) => ({
            ...prev,
            message: { text: "", type: "", bookingId: null },
          })),
        3000,
      );
    } catch (error) {
      setState((prev) => ({
        ...prev,
        message: { text: handleApiError(error), type: "error", bookingId },
      }));
      setTimeout(
        () =>
          setState((prev) => ({
            ...prev,
            message: { text: "", type: "", bookingId: null },
          })),
        3000,
      );
    }
  };

  if (state.loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent mx-auto"></div>
          <p className="text-white mt-4">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Scan Notification */}
      {scanNotification?.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-black p-6 rounded-lg shadow-2xl border-l-8 border-green-800 max-w-md">
            <div className="flex items-start">
              <span className="text-3xl mr-4">🎟️</span>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Ticket Scanned!</h3>
                <p className="text-green-100 mt-1">
                  Your ticket has been scanned!
                </p>
                <div className="bg-white bg-opacity-20 rounded p-3 mt-3">
                  <p>Event: {scanNotification.eventName}</p>
                  <p className="mt-1">
                    ✅ {scanNotification.scannedCount}/
                    {scanNotification.totalTickets} tickets used
                  </p>
                  <p className="text-sm mt-1">Time: {scanNotification.time}</p>
                </div>
              </div>
              <button
                onClick={() => setScanNotification(null)}
                className="ml-4 text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-black text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h2 className="text-2xl font-bold">My Bookings</h2>
          <button
            onClick={() => navigate("/user")}
            className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
          >
            Home
          </button>
        </div>
      </nav>

      <div className="h-3 bg-gradient-to-r from-red-700 via-orange-600 to-yellow-500"></div>

      {/* Stats */}
      <div className="container mx-auto px-4 py-4">
        <p className="text-gray-400">
          {state.bookings.length}{" "}
          {state.bookings.length === 1 ? "booking" : "bookings"} found
        </p>
      </div>

      {/* Bookings Grid */}
      <div className="container mx-auto px-4 py-6 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.bookings.map((booking) => {
            const usedTickets = booking.ticketsUsed || 0;
            const totalTickets = booking.totalTickets;
            const allTicketsUsed = usedTickets === totalTickets;
            const isExpanded = qrState.expandedId === booking.id;
            const showQr =
              isExpanded && qrState.data && qrState.bookingId === booking.id;
            const showMessage =
              state.message.bookingId === booking.id && state.message.text;

            return (
              <div
                key={booking.id}
                className={`bg-gray-800 rounded-lg p-6 shadow-lg transition ${
                  allTicketsUsed ? "opacity-75" : ""
                } ${isExpanded ? "md:col-span-2 lg:col-span-1" : ""}`}
              >
                {/* Message */}
                {showMessage && (
                  <div
                    className={`mb-4 p-3 rounded-lg text-sm ${
                      state.message.type === "success"
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {state.message.text}
                  </div>
                )}

                {/* Booking Header */}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-white font-bold text-lg">
                    {booking.event?.name || "Event"}
                  </h3>
                  {usedTickets > 0 && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      {usedTickets}/{totalTickets} Used
                    </span>
                  )}
                </div>

                {/* Booking Details */}
                <div className="space-y-2 text-gray-300 mb-4">
                  <p>Tickets: {totalTickets}</p>
                  <p>
                    Date: {new Date(booking.event?.date).toLocaleDateString()}
                  </p>
                  {usedTickets > 0 && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${(usedTickets / totalTickets) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {!booking.qrGenerated ? (
                    <>
                      <button
                        onClick={() => handleDelete(booking.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleGenerateQr(booking.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                      >
                        Generate QR
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          isExpanded
                            ? handleCloseQr()
                            : handleViewQr(booking.id)
                        }
                        disabled={allTicketsUsed}
                        className={`px-3 py-1 rounded transition ${
                          allTicketsUsed
                            ? "bg-gray-600 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {allTicketsUsed
                          ? "All Used"
                          : isExpanded
                            ? "Hide QR"
                            : "View QR"}
                      </button>

                      {allTicketsUsed && (
                        <button
                          onClick={() => handleRemoveCompleted(booking.id)}
                          className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition"
                        >
                          Remove
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* QR Codes */}
                {showQr && Array.isArray(qrState.data) && (
                  <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                    <h4 className="text-white font-semibold mb-3">
                      Your Tickets
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {qrState.data.map((qrCode, idx) => (
                        <div
                          key={idx}
                          className="bg-white rounded-lg p-3 flex flex-col items-center"
                        >
                          <QRCodeCanvas value={qrCode} size={120} />
                          <p className="text-xs mt-2 font-medium">
                            Ticket #{idx + 1}
                          </p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-3 text-center">
                      Show QR codes at venue entrance
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {state.bookings.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-xl">No bookings found</p>
            <button
              onClick={() => navigate("/user")}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Browse Events
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto">
        <div className="h-3 bg-gradient-to-r from-red-700 via-orange-600 to-yellow-500"></div>
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
