import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { validateTicket } from "../api";
import { useNavigate } from "react-router-dom";

export default function CheckerPage() {
  const [scanState, setScanState] = useState({
    status: "idle", // idle, scanning, validating, success, error
    result: null,
    message: "",
  });
  const [stats, setStats] = useState({ today: 0, venue: "85%" });
  const [isScannerReady, setIsScannerReady] = useState(false);
  const scannerRef = useRef(null);
  const readerId = "qr-reader";
  const navigate = useNavigate();

  // Get user info
  const user = JSON.parse(localStorage.getItem("user"));
  const checkerName = user?.name || "Checker";

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => setIsScannerReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isScannerReady) return;

    const initScanner = () => {
      const element = document.getElementById(readerId);
      if (!element) {
        setTimeout(initScanner, 100);
        return;
      }

      // Clean up existing scanner
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }

      // Initialize new scanner
      scannerRef.current = new Html5QrcodeScanner(
        readerId,
        {
          fps: 10,
          qrbox: { width: 200, height: 200 },
          rememberLastUsedCamera: true,
          showTorchButtonIfSupported: true,
          aspectRatio: 1.0,
        },
        false,
      );
    };

    initScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [isScannerReady]);

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      setScanState((prev) => ({ ...prev, status: "idle" }));
    }
  };

  const startScanner = () => {
    if (!scannerRef.current) return;

    setScanState({
      status: "scanning",
      result: null,
      message: "",
    });

    scannerRef.current.render(
      (decodedText) => handleScanSuccess(decodedText),
      (error) => {
        // Silent fail - only log in development
        if (import.meta.env.DEV) {
          console.log("Scan error:", error);
        }
      },
    );
  };

  const handleScanSuccess = async (decodedText) => {
    try {
      stopScanner();
      setScanState((prev) => ({ ...prev, status: "validating" }));

      const response = await validateTicket(decodedText);

      if (response.data.status === "success") {
        setScanState({
          status: "success",
          result: response.data,
          message: response.data.message || "✅ Valid Ticket!",
        });
        setStats((prev) => ({ ...prev, today: prev.today + 1 }));
      } else {
        setScanState({
          status: "error",
          result: response.data,
          message: response.data.message || "❌ Invalid Ticket!",
        });
        // Auto restart scanner after 3 seconds
        setTimeout(() => startScanner(), 3000);
      }
    } catch (error) {
      setScanState({
        status: "error",
        result: null,
        message: error.response?.data?.message || "❌ Validation failed!",
      });
      setTimeout(() => startScanner(), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const getMessageText = (msg) => {
    if (typeof msg === "string") return msg;
    return msg?.message || "Unknown error";
  };

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

          <div className="hidden md:block">
            <p className="text-gray-300">Welcome, {checkerName + " !"}</p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() =>
                (window.location.href = "mailto:support@nebula.com")
              }
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 hover:opacity-90 transition"
            >
              Contact Us
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Gradient Bar */}
      <div className="h-3 bg-gradient-to-r from-red-700 via-orange-600 to-yellow-500"></div>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-3xl">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              🎟️ Ticket Checker
            </h2>
            <div className="h-1 w-24 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          {/* Status Bar */}
          <div className="mb-6 bg-gray-300 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Status:</span>
              <div className="flex items-center space-x-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-bold ${
                    scanState.status === "scanning"
                      ? "bg-green-500 text-white"
                      : scanState.status === "validating"
                        ? "bg-yellow-500 text-white"
                        : scanState.status === "success"
                          ? "bg-green-600 text-white"
                          : scanState.status === "error"
                            ? "bg-red-500 text-white"
                            : "bg-gray-500 text-white"
                  }`}
                >
                  {scanState.status === "scanning"
                    ? "🟢 SCANNING"
                    : scanState.status === "validating"
                      ? "🟡 VALIDATING"
                      : scanState.status === "success"
                        ? "✅ SUCCESS"
                        : scanState.status === "error"
                          ? "❌ ERROR"
                          : "⚪ READY"}
                </span>

                {scanState.status === "scanning" && (
                  <button
                    onClick={stopScanner}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition"
                  >
                    Stop
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* QR Scanner Container */}
          <div
            id={readerId}
            className="w-full bg-gray-100 rounded-lg overflow-hidden"
          />

          {/* Scanner Not Ready */}
          {!isScannerReady && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600">Initializing camera...</p>
            </div>
          )}

          {/* Start Button */}
          {scanState.status === "idle" && isScannerReady && (
            <div className="text-center py-12">
              <button
                onClick={startScanner}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-8 rounded-xl text-xl transform transition hover:scale-105 shadow-lg"
              >
                📷 START SCANNING
              </button>
              <p className="text-gray-500 mt-3">
                Click to begin scanning tickets
              </p>
            </div>
          )}

          {/* Validating State */}
          {scanState.status === "validating" && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-xl text-gray-600">Validating ticket...</p>
            </div>
          )}

          {/* Success State */}
          {scanState.status === "success" && scanState.result && (
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">✅ VALID TICKET!</h3>
              <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-4 text-left">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🎫</span>
                    <div>
                      <p className="text-black text-sm opacity-90">
                        Ticket Number
                      </p>
                      <p className="text-black font-bold">
                        {scanState.result.ticketNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📋</span>
                    <div>
                      <p className="text-black text-sm opacity-90">Event</p>
                      <p className="text-black font-bold">
                        {scanState.result.eventName || "Event"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">👤</span>
                    <div>
                      <p className="text-black text-sm opacity-90">Attendee</p>
                      <p className="text-black font-bold">
                        {scanState.result.attendeeName || "Guest"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={startScanner}
                className="bg-white text-green-600 font-bold py-3 px-6 rounded-lg hover:bg-green-50 transition transform hover:scale-105"
              >
                Scan Next Ticket →
              </button>
            </div>
          )}

          {/* Error State */}
          {scanState.status === "error" && (
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white text-center">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-2xl font-bold mb-4">
                {getMessageText(scanState.message)}
              </h3>
              <div className="bg-white bg-opacity-20 rounded-xl p-3 mb-4">
                <p className="text-sm">
                  {scanState.message.toLowerCase().includes("already used")
                    ? "This ticket has already been scanned!"
                    : "Please check the QR code and try again."}
                </p>
              </div>
              <button
                onClick={startScanner}
                className="bg-white text-red-600 font-bold py-3 px-6 rounded-lg hover:bg-red-50 transition transform hover:scale-105"
              >
                Try Again →
              </button>
            </div>
          )}

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-blue-300 p-4 rounded-xl text-center">
              <span className="block text-3xl font-bold text-blue-800">
                {stats.today}
              </span>
              <span className="text-sm text-gray-800">Scanned Today</span>
            </div>
            <div className="bg-purple-300 p-4 rounded-xl text-center">
              <span className="block text-3xl font-bold text-purple-800">
                {stats.venue}
              </span>
              <span className="text-sm text-gray-800">Venue Capacity</span>
            </div>
          </div>
        </div>
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
