import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("create");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Data states
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [regularUsers, setRegularUsers] = useState([]);
  const [ticketCheckers, setTicketCheckers] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Form state for create event
  const [formData, setFormData] = useState({
    name: "",
    artist: "",
    location: "",
    date: "",
    time: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const API_BASE_URL = "http://localhost:8080/api";
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === "events") {
      loadEvents();
    } else if (activeTab === "users") {
      loadRegularUsers();
    } else if (activeTab === "ticket-checkers") {
      loadTicketCheckers();
    } else if (activeTab === "bookings") {
      loadBookings();
    } else if (activeTab === "all-users") {
      loadAllUsers();
    }
  }, [activeTab]);

  // Load all events
  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(response.data);
    } catch (error) {
      console.error("Error loading events:", error);
      setMessage({ type: "error", text: "Failed to load events" });
    } finally {
      setLoading(false);
    }
  };

  // Load all users (all roles)
  const loadAllUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/registerusers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error loading all users:", error);
      setMessage({ type: "error", text: "Failed to load users" });
    } finally {
      setLoading(false);
    }
  };

  // Load regular users (role = USER)
  const loadRegularUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRegularUsers(response.data);
    } catch (error) {
      console.error("Error loading regular users:", error);
      setMessage({ type: "error", text: "Failed to load users" });
    } finally {
      setLoading(false);
    }
  };

  // Load ticket checkers
  const loadTicketCheckers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/ticket-checkers`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setTicketCheckers(response.data);
    } catch (error) {
      console.error("Error loading ticket checkers:", error);
      setMessage({ type: "error", text: "Failed to load ticket checkers" });
    } finally {
      setLoading(false);
    }
  };

  // Load all bookings
  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(response.data);
    } catch (error) {
      console.error("Error loading bookings:", error);
      setMessage({ type: "error", text: "Failed to load bookings" });
    } finally {
      setLoading(false);
    }
  };

  // Delete event
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/admin/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEvents(events.filter((event) => event.id !== eventId));
      setMessage({ type: "success", text: "Event deleted successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error deleting event:", error);
      setMessage({ type: "error", text: "Failed to delete event" });
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({
          type: "error",
          text: "Image size should be less than 5MB",
        });
        return;
      }

      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    document.getElementById("imageInput").value = "";
  };

  // ✅ FIXED: handleSubmit function - Removed Content-Type header
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("artist", formData.artist);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("date", formData.date);
      formDataToSend.append("time", formData.time);

      if (imageFile) {
        formDataToSend.append("image", imageFile); // Make sure name is "image"
      }

      // ✅ IMPORTANT: Don't set Content-Type header, browser will set it automatically
      await axios.post(`${API_BASE_URL}/admin/events`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          // ❌ REMOVED: "Content-Type": "multipart/form-data"
        },
      });

      setMessage({ type: "success", text: "Event created successfully!" });

      // Reset form
      setFormData({
        name: "",
        artist: "",
        location: "",
        date: "",
        time: "",
      });
      setImageFile(null);
      setImagePreview(null);

      if (activeTab === "events") {
        loadEvents();
      }

      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error creating event:", error);

      // ✅ Better error message
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Failed to create event";

      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Navbar - Same style as user navigation */}
      <nav className="user-nav bg-black text-white p-4 flex justify-between items-center">
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

        <div className="nav-left">
          <h1 className="logo text-2xl font-bold">⚡ Admin Dashboard</h1>
        </div>
        <div className="nav-right flex items-center space-x-4">
          {/* Contact Us Button with gradient */}
          <button
            onClick={() => navigate("/contact")}
            className="px-6 py-2 rounded-lg font-medium text-white transition transform hover:scale-105"
            style={{
              background:
                "linear-gradient(90deg, #ffd000 0%, #ff7a00 50%, #ff0057 100%)",
            }}
          >
            Contact Us
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className=" hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200 font-medium"
            style={{ background: " #ff0057" }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div
        className="w-full h-7"
        style={{
          background:
            "linear-gradient(90deg, #ff0057 0%, #ff7a00 50%, #ffd000 100%)",
        }}
      ></div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 5 Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("create")}
            className={`px-6 py-3 rounded-lg font-medium transition duration-200 whitespace-nowrap ${
              activeTab === "create"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            ➕ Create Event
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`px-6 py-3 rounded-lg font-medium transition duration-200 whitespace-nowrap ${
              activeTab === "events"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            📋 All Events
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-6 py-3 rounded-lg font-medium transition duration-200 whitespace-nowrap ${
              activeTab === "bookings"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            📅 Bookings
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 rounded-lg font-medium transition duration-200 whitespace-nowrap ${
              activeTab === "users"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            👥 Regular Users
          </button>
          <button
            onClick={() => setActiveTab("all-users")}
            className={`px-6 py-3 rounded-lg font-medium transition duration-200 whitespace-nowrap ${
              activeTab === "all-users"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            📋 All Users
          </button>
          <button
            onClick={() => setActiveTab("ticket-checkers")}
            className={`px-6 py-3 rounded-lg font-medium transition duration-200 whitespace-nowrap ${
              activeTab === "ticket-checkers"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            🎫 Ticket Checkers
          </button>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-100 text-green-700 border border-green-400"
                : "bg-red-100 text-red-700 border border-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* CREATE EVENT TAB */}
        {activeTab === "create" && !loading && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Create New Event
            </h2>

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
              encType="multipart/form-data"
            >
              {/* Image Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Image
                </label>

                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-64 h-40 object-cover rounded-lg shadow-md"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white w-8 h-8 rounded-full hover:bg-red-600 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-center px-6 pt-5 pb-6">
                    <div className="space-y-2 text-center">
                      <div className="text-4xl mb-2">📸</div>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="imageInput"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                        >
                          <span>Upload an image</span>
                          <input
                            id="imageInput"
                            name="image"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Summer Music Festival"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Artist/Performer *
                  </label>
                  <input
                    type="text"
                    name="artist"
                    value={formData.artist}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Arijit Singh"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Mumbai"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-8 py-3 bg-blue-600 text-white rounded-lg font-medium transition duration-200 ${
                    loading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-blue-700"
                  }`}
                >
                  {loading ? "Creating..." : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ALL EVENTS TAB */}
        {activeTab === "events" && !loading && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              All Events
            </h2>

            {events.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No events found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Artist
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {events.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={
                              event.imageUrl
                                ? event.imageUrl.startsWith("http")
                                  ? event.imageUrl
                                  : `http://localhost:8080${event.imageUrl}`
                                : "/images/default-event.jpg"
                            }
                            alt={event.name}
                            className="w-16 h-12 object-cover rounded"
                            onError={(e) => {
                              e.target.src = "/images/default-event.jpg";
                            }}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {event.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {event.artist}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {event.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {event.date} {event.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-red-700 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-lg transition duration-200"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* BOOKINGS TAB */}
        {/* BOOKINGS TAB */}
        {activeTab === "bookings" && !loading && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              All Bookings
            </h2>

            {bookings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No bookings found
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-300">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tickets
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        QR Generated
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking) => {
                      // Debug: Log the booking object to see available properties
                      console.log("Booking data:", booking);

                      return (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            #{booking.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.user?.name ||
                                booking.userName ||
                                booking.user?.username ||
                                "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.user?.email ||
                                booking.userEmail ||
                                "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {booking.event?.name || booking.eventName || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {/* Try different possible property names */}
                            {booking.totalTickets ||
                              booking.numberOfTickets ||
                              booking.ticketCount ||
                              booking.quantity ||
                              booking.tickets ||
                              "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            ₹
                            {booking.totalAmount ||
                              booking.amount ||
                              booking.price ||
                              booking.totalPrice ||
                              "0"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                booking.status === "CONFIRMED" ||
                                booking.status === "confirmed"
                                  ? "bg-green-100 text-green-800"
                                  : booking.status === "PENDING" ||
                                      booking.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : booking.status === "CANCELLED" ||
                                        booking.status === "cancelled"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {booking.status || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                booking.qrGenerated
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {booking.qrGenerated ? "✅ Yes" : "❌ No"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* REGULAR USERS TAB */}
        {activeTab === "users" && !loading && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Regular Users (Role: USER)
            </h2>

            {regularUsers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No regular users found
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-300">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {regularUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-300 text-blue-900">
                            {user.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ALL USERS TAB */}
        {activeTab === "all-users" && !loading && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              All Users (All Roles)
            </h2>

            {users.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No users found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-300">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === "ADMIN"
                                ? "bg-purple-300 text-purple-900"
                                : user.role === "TICKET_CHECKER"
                                  ? "bg-green-300 text-green-900"
                                  : "bg-blue-300 text-blue-900"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TICKET CHECKERS TAB */}
        {activeTab === "ticket-checkers" && !loading && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Ticket Checkers
            </h2>

            {ticketCheckers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No ticket checkers found
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-300">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ticketCheckers.map((checker) => (
                      <tr key={checker.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {checker.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {checker.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {checker.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-300 text-green-900">
                            {checker.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Section - Always at bottom */}
      <div className="w-full mt-auto">
        {/* Gradient bar */}
        <div
          className="w-full h-7"
          style={{
            background:
              "linear-gradient(90deg, #ff0057 0%, #ff7a00 50%, #ffd000 100%)",
          }}
        />

        {/* Footer */}
        <footer className="bg-black text-white w-full py-4 text-center border-t border-gray-800">
          <p className="m-0">© 2026 Nebula. All rights reserved.</p>
          <p className="m-0">🌌 Nebula - Discover Your Next Experience</p>
        </footer>
      </div>
    </div>
  );
}
