import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8080/api",
});

// const API = axios.create({
//     baseURL: "http://192.168.1.10:8080/api", // localhost nahi, PC ka IP
// });

// Add token to request
API.interceptors.request.use((config) => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
        try {
            const user = JSON.parse(userStr);

            // Check different possible token locations
            const token = user?.token || user?.user?.token || user?.jwt || user?.accessToken;

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                console.log("✅ Token added to request");
            } else {
                console.warn("❌ No token found in user object:", user);
            }
        } catch (e) {
            console.error("Error parsing user from localStorage:", e);
        }
    } else {
        console.warn("❌ No user found in localStorage");
    }
    return config;
});

// ===================   AUTH APIs   ===============================
export const login = (data) => API.post("/auth/login", data);
export const register = (data) => API.post("/auth/register", data);

// ===================   EVENTS APIs   ===============================
export const fetchEvents = () => API.get("/events");
export const fetchEventById = (id) => API.get(`/events/${id}`);

// ===================   BOOKINGS APIs   ===============================
export const bookEvent = (eventId, totalTickets) =>
    API.post("/booking", {
        eventId,
        totalTickets,
    });

export const fetchUserBookings = () =>
    API.get("/booking/mybookings");

export const deleteBooking = (bookingId) =>
    API.delete(`/booking/${bookingId}`);

export const fetchTickets = (id) =>
    API.get(`/booking/booking/${id}/tickets`);  // Fixed URL to match your controller

// ===================   QR APIs   ===============================
export const generateQr = (bookingId) =>
    API.post(`/qr/generate/${bookingId}`);

// ===================   TICKET SCAN APIs   ===============================
// For CHECKER role - Validate ticket and mark as used
export const validateTicket = (qrCode) =>
    API.post("/scan/validate", { qrCode });

// ✅ NEW: For USER role - Check if ticket has been scanned (polling)
// export const checkTicketStatus = (bookingId) =>
//     API.get(`/scan/status/${bookingId}`);

// ✅ NEW: Get single ticket details
export const getTicketDetails = (ticketId) =>
    API.get(`/tickets/${ticketId}`);

export const checkTicketStatus = (id) => API.get(`/scan/public/status/${id}`);

// ===================   ADMIN APIs   ===============================
export const fetchAllBookings = () => API.get("/admin/bookings");
export const fetchAllUsers = () => API.get("/admin/registerusers");
export const fetchAllUsersByRole = (role) => API.get(`/admin/${role}`);
export const fetchTicketCheckers = () => API.get("/admin/ticket-checkers");

// ===================   ERROR HANDLER HELPER   ===============================
export const handleApiError = (error) => {
    if (error.response) {
        // Server responded with error status
        return error.response.data?.message || "Server error occurred";
    } else if (error.request) {
        // Request made but no response
        return "No response from server. Please check if backend is running.";
    } else {
        // Something else happened
        return error.message || "An error occurred";
    }
};


// ===================   TEST APIs   ===============================
// ✅ TEMPORARY: Test TICKET_CHECKER role
export const testTicketCheckerRole = async () => {
    try {
        const response = await API.get("/test/check-role");
        console.log("✅ Role test successful:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Role test failed:", error.response?.status, error.response?.data);
        throw error;
    }
};




export default API;