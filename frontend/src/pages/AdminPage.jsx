import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  fetchEvents,
  fetchAllUsers,
  fetchUsersByRole,
  fetchTicketCheckers,
  fetchAllBookings,
  createEvent,
  deleteEvent,
  handleApiError,
} from "../api";

// Constants
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
const DEFAULT_IMAGE = `${BACKEND_URL}/uploads/events/default-event.jpg`;

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

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    artist: "",
    location: "",
    date: "",
    time: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [failedImages, setFailedImages] = useState(new Set());

  // Load data based on active tab
  useEffect(() => {
    const loadData = {
      events: () => loadEvents(),
      users: () => loadRegularUsers(),
      "ticket-checkers": () => loadTicketCheckers(),
      bookings: () => loadBookings(),
      "all-users": () => loadAllUsers(),
    }[activeTab];

    if (loadData) loadData();
  }, [activeTab]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await fetchEvents();
      setEvents(response.data);
    } catch (error) {
      setMessage({ type: "error", text: handleApiError(error) });
    } finally {
      setLoading(false);
    }
  };

  const loadAllUsers = async () => {
    setLoading(true);
    try {
      const response = await fetchAllUsers();
      setUsers(response.data);
    } catch (error) {
      setMessage({ type: "error", text: handleApiError(error) });
    } finally {
      setLoading(false);
    }
  };

  const loadRegularUsers = async () => {
    setLoading(true);
    try {
      const response = await fetchUsersByRole("user");
      setRegularUsers(response.data);
    } catch (error) {
      setMessage({ type: "error", text: handleApiError(error) });
    } finally {
      setLoading(false);
    }
  };

  const loadTicketCheckers = async () => {
    setLoading(true);
    try {
      const response = await fetchTicketCheckers();
      setTicketCheckers(response.data);
    } catch (error) {
      setMessage({ type: "error", text: handleApiError(error) });
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await fetchAllBookings();
      setBookings(response.data);
    } catch (error) {
      setMessage({ type: "error", text: handleApiError(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await deleteEvent(eventId);
      setEvents(events.filter((event) => event.id !== eventId));
      setMessage({ type: "success", text: "Event deleted successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ type: "error", text: handleApiError(error) });
    }
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size should be less than 5MB" });
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      await createEvent(formDataToSend);

      setMessage({ type: "success", text: "Event created successfully!" });

      // Reset form
      setFormData({ name: "", artist: "", location: "", date: "", time: "" });
      setImageFile(null);
      setImagePreview(null);

      if (activeTab === "events") {
        loadEvents();
      }

      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ type: "error", text: handleApiError(error) });
    } finally {
      setLoading(false);
    }
  };

  const getEventImageUrl = (event) => {
    if (failedImages.has(event.id)) return DEFAULT_IMAGE;
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
    setFailedImages((prev) => new Set([...prev, eventId]));
  };

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-black text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">⚡ Admin Dashboard !</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate("/contact")}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 hover:opacity-90 transition"
            >
              Contact Us
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="h-3 bg-gradient-to-r from-red-700 via-orange-600 to-yellow-500"></div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: "create", label: "➕ Create Event" },
            { id: "events", label: "📋 All Events" },
            { id: "bookings", label: "📅 Bookings" },
            { id: "users", label: "👥 Regular Users" },
            { id: "all-users", label: "📋 All Users" },
            { id: "ticket-checkers", label: "🎫 Ticket Checkers" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-200 text-green-700 border border-green-400"
                : "bg-red-200 text-red-700 border border-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {/* Create Event Tab */}
            {activeTab === "create" && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6">Create New Event</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Image Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6">
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-64 h-40 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white w-8 h-8 rounded-full hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <input
                          type="file"
                          id="image"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="image"
                          className="cursor-pointer inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Choose Image
                        </label>
                        <p className="text-sm text-gray-500 mt-2">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        name: "name",
                        label: "Event Name",
                        type: "text",
                        placeholder: "Summer Music Festival",
                      },
                      {
                        name: "artist",
                        label: "Artist",
                        type: "text",
                        placeholder: "Arijit Singh",
                      },
                      {
                        name: "location",
                        label: "Location",
                        type: "text",
                        placeholder: "Mumbai",
                      },
                      { name: "date", label: "Date", type: "date" },
                      { name: "time", label: "Time", type: "time" },
                    ].map((field) => (
                      <div key={field.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {field.label} *
                        </label>
                        <input
                          type={field.type}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          {...(field.placeholder && {
                            placeholder: field.placeholder,
                          })}
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Create Event"}
                  </button>
                </form>
              </div>
            )}

            {/* Events Tab */}
            {activeTab === "events" && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6">All Events</h2>
                {events.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No events found
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left">Image</th>
                          <th className="px-6 py-3 text-left">Name</th>
                          <th className="px-6 py-3 text-left">Artist</th>
                          <th className="px-6 py-3 text-left">Location</th>
                          <th className="px-6 py-3 text-left">Date & Time</th>
                          <th className="px-6 py-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.map((event) => (
                          <tr key={event.id} className="hover:bg-gray-100">
                            <td className="px-6 py-4">
                              <img
                                src={getEventImageUrl(event)}
                                alt={event.name}
                                className="w-16 h-12 object-cover rounded"
                                onError={() => handleImageError(event.id)}
                              />
                            </td>
                            <td className="px-6 py-4">{event.name}</td>
                            <td className="px-6 py-4">{event.artist}</td>
                            <td className="px-6 py-4">{event.location}</td>
                            <td className="px-6 py-4">
                              {event.date} {event.time}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleDeleteEvent(event.id)}
                                className="text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 px-3 py-1 rounded"
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

            {/* Bookings Tab */}
            {activeTab === "bookings" && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6">All Bookings</h2>
                {bookings.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No bookings found
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left">ID</th>
                          <th className="px-6 py-3 text-left">User</th>
                          <th className="px-6 py-3 text-left">Event</th>
                          <th className="px-6 py-3 text-left">Tickets</th>
                          <th className="px-6 py-3 text-left">QR Generated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-gray-100">
                            <td className="px-6 py-4">#{booking.id}</td>
                            <td className="px-6 py-4">
                              <div>{booking.user?.name || "N/A"}</div>
                              <div className="text-sm text-gray-500">
                                {booking.user?.email}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {booking.event?.name || "N/A"}
                            </td>
                            <td className="px-6 py-4">
                              {booking.totalTickets}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  booking.qrGenerated
                                    ? "bg-green-200 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {booking.qrGenerated ? "Yes" : "No"}
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

            {/* Users Tabs */}
            {activeTab === "users" && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6">Regular Users</h2>
                <UserTable users={regularUsers} />
              </div>
            )}

            {activeTab === "all-users" && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                  All Users
                </h2>
                <UserTable users={users} showRole />
              </div>
            )}

            {activeTab === "ticket-checkers" && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6">Ticket Checkers</h2>
                <UserTable users={ticketCheckers} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12">
        <div className="h-3 bg-gradient-to-r from-red-700 via-orange-600 to-yellow-500"></div>
        <footer className="bg-black text-white py-6 text-center">
          <p>© 2026 Nebula. All rights reserved.</p>
          <p className="text-gray-400 text-sm mt-2">
            Nebula - Discover Your Next Experience
          </p>
        </footer>
      </div>
    </div>
  );
}

// Helper Component
const UserTable = ({ users, showRole = false }) => {
  if (users.length === 0) {
    return <p className="text-gray-500 text-center py-8">No users found</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">ID</th>
            <th className="px-6 py-3 text-left">Name</th>
            <th className="px-6 py-3 text-left">Email</th>
            {showRole && <th className="px-6 py-3 text-left">Role</th>}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">{user.id}</td>
              <td className="px-6 py-4">{user.name}</td>
              <td className="px-6 py-4">{user.email}</td>
              {showRole && (
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.role === "ADMIN"
                        ? "bg-purple-100 text-purple-800"
                        : user.role === "TICKET_CHECKER"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
