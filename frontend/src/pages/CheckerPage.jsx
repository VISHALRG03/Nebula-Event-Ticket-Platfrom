import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { validateTicket } from "../api";
import { useNavigate } from "react-router-dom";

export default function CheckerPage() {
  const [scanResult, setScanResult] = useState(null);
  const [scanStatus, setScanStatus] = useState("idle");
  const [stats, setStats] = useState({ today: 0, venue: "85%" });
  const [isScannerReady, setIsScannerReady] = useState(false);
  const [isScanning, setIsScanning] = useState(false); // New state to track scanning
  const scannerRef = useRef(null);
  const readerId = "qr-reader";
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const checkerId = user?.user?.id || user?.id || 1;

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Contact Us function
  const handleContactUs = () => {
    alert("Contact us at: support@eventhub.com");
  };

  // ✅ FIX: Simple beep sound without audio file
  const playSuccessSound = () => {
    try {
      const audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch {
      // Ignore audio errors silently
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsScannerReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Initialize scanner
  useEffect(() => {
    if (!isScannerReady) return;

    const initScanner = () => {
      const element = document.getElementById(readerId);
      if (!element) {
        setTimeout(initScanner, 100);
        return;
      }

      // Clear any existing scanner
      if (scannerRef.current) {
        try {
          scannerRef.current.clear().catch(console.error);
        } catch (e) {
          console.log("Scanner clear error:", e);
        }
      }

      // Create new scanner
      scannerRef.current = new Html5QrcodeScanner(
        readerId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }, // Slightly larger for better scanning
          rememberLastUsedCamera: true,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 1,
          aspectRatio: 1.0,
        },
        /* verbose= */ false,
      );
    };

    initScanner();

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear().catch(console.error);
        } catch (e) {
          console.log("Scanner clear error:", e);
        }
      }
    };
  }, [isScannerReady]);

  const startScanner = () => {
    if (scannerRef.current) {
      setIsScanning(true);
      setScanStatus("scanning");
      setScanResult(null);

      // Render the scanner with callbacks
      scannerRef.current.render(
        (decodedText) => {
          // Success callback
          handleScanSuccess(decodedText);
        },
        () => {
          // Error callback - ignore most errors
          // console.log("Scan error:", errorMessage);
        },
      );
    } else {
      setTimeout(startScanner, 200);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear().catch(console.error);
        setIsScanning(false);
        setScanStatus("idle");
      } catch (e) {
        console.log("Stop scanner error:", e);
      }
    }
  };

  const handleScanSuccess = async (decodedText) => {
    try {
      // Stop scanner immediately
      stopScanner();

      setScanStatus("validating");

      const response = await validateTicket(decodedText);
      console.log("Validation response:", response.data);

      if (response.data.status === "success") {
        setScanResult(response.data);
        setScanStatus("success");
        playSuccessSound();
        setStats((prev) => ({ ...prev, today: prev.today + 1 }));
      } else {
        setScanResult(response.data);
        setScanStatus("error");

        // Auto restart after 3 seconds
        setTimeout(() => {
          startScanner();
        }, 3000);
      }
    } catch (error) {
      console.error("Validation error:", error);
      setScanStatus("error");
      setScanResult({
        status: "error",
        message:
          error.response?.data?.message || "❌ Invalid or expired ticket!",
      });

      setTimeout(() => {
        startScanner();
      }, 3000);
    }
  };

  const handleScanAgain = () => {
    startScanner();
  };

  const getMessageText = (msg) => {
    if (typeof msg === "string") return msg;
    if (msg && typeof msg === "object" && msg.message) return msg.message;
    return "Invalid Ticket!";
  };

  const isAlreadyUsed = (msg) => {
    const text = getMessageText(msg);
    return text.toLowerCase().includes("already used");
  };

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Navigation */}
      <nav className="bg-black text-white p-4 flex justify-between items-center">
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

        <div className="nav-right flex items-center space-x-4">
          <button
            onClick={handleContactUs}
            className="px-6 py-2 rounded-lg font-medium text-white transition transform hover:scale-105"
            style={{
              background:
                "linear-gradient(90deg, #ffd000 0%, #ff7a00 50%, #ff0057 100%)",
            }}
          >
            Contact Us
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg font-medium text-white transition duration-200"
            style={{ background: "#ff0057" }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Gradient Bar */}
      <div
        className="w-full h-6"
        style={{
          background:
            "linear-gradient(90deg, #ff0057 0%, #ff7a00 50%, #ffd000 100%)",
        }}
      ></div>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              🎟️ Ticket Checker
            </h1>
            <div className="h-1 w-24 bg-blue-600 mx-auto rounded-full"></div>
            <p className="text-gray-900 mt-2">Checker ID: {checkerId}</p>
          </div>

          {/* Scanner Status and Controls */}
          <div className="mb-6">
            <div className="flex items-center justify-between bg-gray-400 p-4 rounded-lg">
              <span className="text-gray-800 font-semibold">
                Scanner Status:
              </span>
              <div className="flex items-center space-x-3">
                <span
                  className={`px-4 py-1 rounded-full text-sm font-bold ${
                    scanStatus === "scanning"
                      ? "bg-green-500 text-white"
                      : scanStatus === "validating"
                        ? "bg-yellow-500 text-white"
                        : scanStatus === "success"
                          ? "bg-green-600 text-white"
                          : scanStatus === "error"
                            ? "bg-red-500 text-white"
                            : "bg-gray-500 text-white"
                  }`}
                >
                  {scanStatus === "scanning"
                    ? "🟢 SCANNING"
                    : scanStatus === "validating"
                      ? "🟡 VALIDATING"
                      : scanStatus === "success"
                        ? "✅ SUCCESS"
                        : scanStatus === "error"
                          ? "❌ ERROR"
                          : "⚪ READY"}
                </span>

                {/* Stop Scan Button - Only visible when scanning */}
                {isScanning && (
                  <button
                    onClick={stopScanner}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg text-sm font-medium transition"
                  >
                    ⏹️ Stop Scan
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* QR Reader Container - Always visible when scanning */}
          <div
            id={readerId}
            className={`bg-black rounded-xl overflow-hidden border-4 border-gray-300 transition-all duration-300 mx-auto ${
              isScanning ? "block" : "hidden"
            }`}
            style={{
              minHeight: "400px", // Increased height to show all buttons
              maxWidth: "500px",
              margin: "0 auto",
            }}
          ></div>

          {/* Loading state */}
          {!isScannerReady && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600">Initializing camera...</p>
            </div>
          )}

          {/* Start Button - Only show when not scanning and no result */}
          {!isScanning && scanStatus === "idle" && isScannerReady && (
            <div className="text-center py-12 ">
              <button
                onClick={startScanner}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
                         text-white font-bold py-4 px-8 rounded-xl text-xl 
                         transform transition hover:scale-105 shadow-lg"
              >
                📷 START SCANNING
              </button>
              <p className="text-gray-500 mt-3">
                Click to begin scanning tickets
              </p>
            </div>
          )}

          {/* Validating State */}
          {scanStatus === "validating" && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-xl text-gray-600">Validating ticket...</p>
            </div>
          )}

          {/* SUCCESS STATE */}
          {scanStatus === "success" && scanResult && (
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white text-center">
              <h2 className="text-2xl font-bold mb-3">VALID TICKET!</h2>

              <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-4 text-left">
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <span className="text-xl mr-2">🎫</span>
                    <div>
                      <p className="text-black text-xs opacity-90">
                        Ticket Number
                      </p>
                      <p className="text-black font-bold">
                        {scanResult.ticketNumber || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="text-xl mr-2">📋</span>
                    <div>
                      <p className="text-black text-xs opacity-90">Event</p>
                      <p className="text-black font-bold">
                        {scanResult.eventName || "Event"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="text-xl mr-2">👤</span>
                    <div>
                      <p className="text-black text-xs opacity-90">Attendee</p>
                      <p className="text-black font-bold">
                        {scanResult.attendeeName ||
                          scanResult.userName ||
                          "Guest"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-lg mb-4">
                {getMessageText(scanResult.message)}
              </p>

              <button
                onClick={handleScanAgain}
                className="bg-white text-green-600 font-bold py-2 px-6 rounded-lg text-lg
                         hover:bg-green-50 transition transform hover:scale-105 shadow"
              >
                Scan Next Ticket →
              </button>
            </div>
          )}

          {/* ERROR STATE */}
          {scanStatus === "error" && scanResult && (
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white text-center">
              <div className="text-6xl mb-3">❌</div>
              <h2 className="text-2xl font-bold mb-4">
                {getMessageText(scanResult.message)}
              </h2>

              <div className="bg-white bg-opacity-20 rounded-xl p-3 mb-4">
                <p className="text-white">
                  {isAlreadyUsed(scanResult.message)
                    ? "This ticket has already been scanned!"
                    : "Please check the QR code and try again."}
                </p>
              </div>

              <button
                onClick={handleScanAgain}
                className="bg-white text-red-600 font-bold py-2 px-6 rounded-lg text-lg
                         hover:bg-red-50 transition transform hover:scale-105 shadow"
              >
                Try Again →
              </button>
            </div>
          )}

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="bg-blue-300 p-3 rounded-xl text-center">
              <span className="block text-2xl font-bold text-blue-600">
                {stats.today}
              </span>
              <span className="text-xs text-gray-700">Scanned Today</span>
            </div>
            <div className="bg-purple-300 p-3 rounded-xl text-center">
              <span className="block text-2xl font-bold text-purple-600">
                {stats.venue}
              </span>
              <span className="text-xs text-gray-700">Venue Capacity</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full mt-auto">
        <div
          className="w-full h-6"
          style={{
            background:
              "linear-gradient(90deg, #ff0057 0%, #ff7a00 50%, #ffd000 100%)",
          }}
        />
        <footer className="bg-black text-white w-full py-3 text-center">
          <p className="text-sm">© 2026 Nebula. All rights reserved.</p>
          <p className="text-xs opacity-75">Discover Your Next Experience</p>
        </footer>
      </div>
    </div>
  );
}
