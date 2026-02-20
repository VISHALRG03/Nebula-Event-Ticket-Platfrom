import axios from "axios";

// Use environment variables with fallback for development
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const API = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10 second timeout
});

// Request interceptor for auth token
API.interceptors.request.use((config) => {
    // Skip for public endpoints
    if (config.url.includes('/auth/')) {
        return config;
    }

    try {
        const userStr = localStorage.getItem("user");
        if (!userStr) return config;

        const user = JSON.parse(userStr);
        const token = user?.token || user?.user?.token || user?.jwt;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch {
        // Silently fail - don't log in production
    }

    return config;
});

// Response interceptor for error handling
API.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized - redirect to login
        if (error.response?.status === 401) {
            localStorage.removeItem("user");
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

// =================== AUTH APIS ===================
export const login = (data) => API.post("/auth/login", data);
export const register = (data) => API.post("/auth/register", data);

// =================== EVENTS APIS ===================
export const fetchEvents = () => API.get("/events");
export const fetchPaginatedEvents = (page) => API.get(`/events/page/${page}`);
export const fetchEventById = (id) => API.get(`/events/${id}`);
export const createEvent = (formData) => API.post("/admin/events", formData);
export const deleteEvent = (id) => API.delete(`/admin/events/${id}`);

// =================== BOOKINGS APIS ===================
export const bookEvent = (eventId, totalTickets) =>
    API.post("/booking", { eventId, totalTickets });

export const fetchUserBookings = () => API.get("/booking/mybookings");
export const deleteBooking = (bookingId) => API.delete(`/booking/${bookingId}`);
export const fetchTicketsByBooking = (bookingId) =>
    API.get(`/booking/booking/${bookingId}/tickets`);

// =================== QR APIS ===================
export const generateQrForBooking = (bookingId) =>
    API.post(`/qr/generate/${bookingId}`);

// =================== SCAN APIS ===================
export const validateTicket = (qrCode) =>
    API.post("/scan/validate", { qrCode });

export const checkTicketStatus = (bookingId) =>
    API.get(`/scan/public/status/${bookingId}`);

// =================== ADMIN APIS ===================
export const fetchAllBookings = () => API.get("/admin/bookings");
export const fetchAllUsers = () => API.get("/admin/registerusers");
export const fetchUsersByRole = (role) => API.get(`/admin/${role}`);
export const fetchTicketCheckers = () => API.get("/admin/ticket-checkers");

// =================== ERROR HANDLER ===================
export const handleApiError = (error) => {
    if (error.response) {
        return error.response.data?.message || "Server error occurred";
    } else if (error.request) {
        return "Unable to connect to server. Please check your internet connection.";
    } else {
        return error.message || "An unexpected error occurred";
    }
};

export default API;