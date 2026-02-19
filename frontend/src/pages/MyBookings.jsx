import { useEffect, useState } from "react";
import {
  fetchUserBookings,
  deleteBooking,
  generateQr,
  fetchTickets,
  checkTicketStatus,
} from "../api";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [qrData, setQrData] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  const [scanNotification, setScanNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationShown, setNotificationShown] = useState(false);
  const [allScanned, setAllScanned] = useState(false);
  const [errorMessage, setErrorMessage] = useState({
    text: "",
    type: "",
    bookingId: null,
  }); // New state for error messages
  const navigate = useNavigate();

  // Load bookings on mount
  useEffect(() => {
    let isMounted = true;

    const loadBookings = async () => {
      try {
        const res = await fetchUserBookings();
        if (isMounted) {
          setBookings(res.data);
        }
      } catch (error) {
        console.error("Error loading bookings:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadBookings();

    return () => {
      isMounted = false;
    };
  }, []);

  // POLLING EFFECT
  useEffect(() => {
    if (!qrData || !selectedBookingId || allScanned) return;

    let intervalId;
    let notificationTimeout;

    const checkStatus = async () => {
      try {
        const res = await checkTicketStatus(selectedBookingId);
        console.log("Status check response:", res.data);

        if (res.data.anyTicketScanned && !notificationShown) {
          console.log("🎯 Setting notification with data:", {
            eventName: res.data.eventName,
            scannedCount: res.data.scannedTickets,
            totalTickets: res.data.totalTickets,
          });

          setScanNotification({
            show: true,
            eventName: res.data.eventName,
            scannedCount: res.data.scannedTickets,
            totalTickets: res.data.totalTickets,
            time: new Date().toLocaleTimeString(),
          });

          setNotificationShown(true);

          notificationTimeout = setTimeout(() => {
            setScanNotification(null);
          }, 5000);

          refreshBookings();

          if (res.data.scannedTickets === res.data.totalTickets) {
            console.log("✅ All tickets scanned");
            setAllScanned(true);
          }
        }
      } catch (error) {
        console.error("Error checking ticket status:", error);
      }
    };

    intervalId = setInterval(checkStatus, 3000);

    return () => {
      clearInterval(intervalId);
      if (notificationTimeout) clearTimeout(notificationTimeout);
    };
  }, [qrData, selectedBookingId, notificationShown, allScanned]);

  const refreshBookings = async () => {
    try {
      const res = await fetchUserBookings();
      setBookings(res.data);
    } catch (error) {
      console.error("Error refreshing bookings:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBooking(id);
      setErrorMessage({
        text: "Booking cancelled successfully",
        type: "success",
        bookingId: id,
      });
      setTimeout(
        () => setErrorMessage({ text: "", type: "", bookingId: null }),
        3000,
      );
      refreshBookings();
    } catch {
      setErrorMessage({
        text: "Failed to cancel booking",
        type: "error",
        bookingId: id,
      });
      setTimeout(
        () => setErrorMessage({ text: "", type: "", bookingId: null }),
        3000,
      );
    }
  };

  const handleGenerateQr = async (id) => {
    try {
      const res = await generateQr(id);
      setQrData(res.data.qrCodes);
      setSelectedBookingId(id);
      setExpandedBookingId(id);
      setNotificationShown(false);
      setAllScanned(false);
      setErrorMessage({
        text: "QR Codes generated successfully!",
        type: "success",
        bookingId: id,
      });
      setTimeout(
        () => setErrorMessage({ text: "", type: "", bookingId: null }),
        3000,
      );
      refreshBookings();
    } catch (err) {
      // Show error message on screen instead of alert
      const errorMsg = err.response?.data?.message || "Failed to generate QR";
      setErrorMessage({
        text: errorMsg,
        type: "error",
        bookingId: id,
      });

      // Auto hide after 4 seconds
      setTimeout(
        () => setErrorMessage({ text: "", type: "", bookingId: null }),
        4000,
      );
    }
  };

  const handleViewQr = async (id) => {
    try {
      const res = await fetchTickets(id);
      setQrData(res.data.map((ticket) => ticket.qrCode));
      setSelectedBookingId(id);
      setExpandedBookingId(id);
      setNotificationShown(false);
      setAllScanned(false);
      setErrorMessage({
        text: "QR Codes loaded successfully!",
        type: "success",
        bookingId: id,
      });
      setTimeout(
        () => setErrorMessage({ text: "", type: "", bookingId: null }),
        3000,
      );
    } catch {
      setErrorMessage({
        text: "Failed to load tickets",
        type: "error",
        bookingId: id,
      });
      setTimeout(
        () => setErrorMessage({ text: "", type: "", bookingId: null }),
        3000,
      );
    }
  };

  const handleCloseQr = (bookingId) => {
    if (expandedBookingId === bookingId) {
      setExpandedBookingId(null);
      setQrData(null);
      setSelectedBookingId(null);
    }
  };

  const handleCloseNotification = () => {
    setScanNotification(null);
    setNotificationShown(false);
  };

  const handleCloseError = () => {
    setErrorMessage({ text: "", type: "", bookingId: null });
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Scan Notification */}
      {scanNotification?.show && (
        <div className="fixed top-4 right-4 z-[9999] animate-slide-in">
          <div className=" bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-2xl border-l-8 border-green-800 max-w-md">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <span className="text-3xl">🎟️</span>
              </div>
              <div className="ml-4 flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold">Ticket Scanned!</h3>
                  <button
                    onClick={handleCloseNotification}
                    className="text-white hover:text-green-200 text-xl"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-green-100 mt-1">
                  Your ticket has been successfully scanned!
                </p>
                <p className="text-green-100 font-semibold mt-2">
                  Enjoy the event! 🎉
                </p>
                <div className="bg-white bg-opacity-20 rounded p-2 mt-3 text-sm">
                  <p className="text-black">
                    Event: {scanNotification.eventName}
                  </p>
                  <p className="text-black font-semi-bold">
                    Time: {scanNotification.time}
                  </p>
                  {scanNotification.scannedCount && (
                    <p className="mt-1 text-black">
                      ✅ {scanNotification.scannedCount}/
                      {scanNotification.totalTickets} tickets scanned
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <div className="flex-grow">
        {/* Navigation */}
        <div className="flex justify-between items-center bg-black w-full p-3 rounded">
          <div>
            <h2 className="text-2xl font-bold text-white pl-16">My Bookings</h2>
          </div>
          <button
            onClick={() => navigate("/user")}
            className="text-white h-10 px-4 mr-9 rounded hover:bg-red-700 transition font-medium"
            style={{
              background: "#ff0057",
            }}
          >
            Home
          </button>
        </div>

        <div
          className="w-full h-6"
          style={{
            background:
              "linear-gradient(90deg, #ff0057 0%, #ff7a00 50%, #ffd000 100%)",
          }}
        ></div>

        <div>
          <p className="text-gray-400 text-sm mt-1 pl-16">
            {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}{" "}
            found
          </p>
        </div>

        {/* Bookings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-black p-4 w-200 mx-auto mt-6">
          {bookings.map((b) => {
            const usedTickets = b.ticketsUsed || 0;
            const allTicketsUsed = usedTickets === b.totalTickets;
            const isExpanded = expandedBookingId === b.id;
            const showQr = isExpanded && qrData && selectedBookingId === b.id;
            const showError =
              errorMessage.bookingId === b.id && errorMessage.text;

            return (
              <div
                key={b.id}
                className={`bg-black-500 p-4 rounded shadow hover:shadow-md transition border ${
                  allTicketsUsed ? "opacity-75" : ""
                } ${isExpanded ? "col-span-1 row-span-2" : ""}`}
              >
                {/* Error/Success Message inside the card */}
                {showError && (
                  <div
                    className={`mb-3 p-2 rounded-lg text-sm flex justify-between items-center ${
                      errorMessage.type === "success"
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    <span>{errorMessage.text}</span>
                    <button
                      onClick={handleCloseError}
                      className="text-white hover:text-gray-200 text-lg font-bold ml-2"
                    >
                      ×
                    </button>
                  </div>
                )}

                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg text-white">
                    {b.event.name}
                  </h3>
                  {usedTickets > 0 && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      {usedTickets}/{b.totalTickets} Used
                    </span>
                  )}
                </div>
                <p className="text-gray-500">Tickets: {b.totalTickets}</p>
                <p className="text-gray-500">
                  Date: {new Date(b.event.date).toLocaleDateString()}
                </p>

                {usedTickets > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-green-600 h-1.5 rounded-full"
                        style={{
                          width: `${(usedTickets / b.totalTickets) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  {!b.qrGenerated && (
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                    >
                      Cancel Booking
                    </button>
                  )}

                  {b.qrGenerated ? (
                    <button
                      onClick={() => handleViewQr(b.id)}
                      disabled={allTicketsUsed}
                      className={`px-3 py-1 rounded transition ${
                        allTicketsUsed
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {allTicketsUsed
                        ? "All Tickets Used"
                        : isExpanded
                          ? "Hide QR"
                          : "View QR"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleGenerateQr(b.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                    >
                      Generate QR Tickets
                    </button>
                  )}

                  {isExpanded && (
                    <button
                      onClick={() => handleCloseQr(b.id)}
                      className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition"
                    >
                      Close
                    </button>
                  )}
                </div>

                {/* QR Code Section */}
                {showQr && (
                  <div className="mt-3 p-5 bg-gray-700 rounded-lg w-full">
                    <div className="flex justify-between items-center mb-3 w-full">
                      <h4 className="font-semibold text-white">Your Tickets</h4>
                      <p className="text-xs text-white opacity-75">
                        Show at venue entrance
                      </p>
                    </div>

                    {Array.isArray(qrData) && (
                      <div className="grid grid-cols-2 gap-3">
                        {qrData.map((qrCode, idx) => (
                          <div
                            key={idx}
                            className="bg-white rounded-lg p-2 flex flex-col items-center py-4"
                          >
                            <QRCodeCanvas value={qrCode} size={145} />
                            <p className="text-xs mt-4 font-medium">
                              Ticket #{idx + 1}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 bg-blue-500 bg-opacity-30 p-2 rounded-lg">
                      <p className="text-xs text-white flex items-center">
                        <span className="text-sm mr-1">ℹ️</span>
                        Scanner will auto-validate at venue
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Section */}
      <div className="w-full mt-auto">
        <div
          className="w-full h-7"
          style={{
            background:
              "linear-gradient(90deg, #ff0057 0%, #ff7a00 50%, #ffd000 100%)",
          }}
        />
        <footer className="bg-black text-white w-full py-4 text-center border-t border-gray-800">
          <p className="m-0">© 2026 Nebula. All rights reserved.</p>
          <br />
          <p className="m-0">Nebula - Discover Your Next Experience</p>
        </footer>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
