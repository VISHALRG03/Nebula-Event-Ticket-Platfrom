import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import "./App.css";
import AuthPage from "./pages/AuthPage.jsx";
import UserPage from "./pages/UserPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import CheckerPage from "./pages/CheckerPage.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import BookingPage from "./pages/BookingPage.jsx";

// ProtectedRoute OUTSIDE App, but user passed as prop
const ProtectedRoute = ({ children, role, user }) => {
  if (!user) return <Navigate to="/" />;
  if (role && user.user.role !== role) return <Navigate to="/" />;
  return children;
};

function App() {
  // user state instead of const
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage setUser={setUser} />} />
        <Route
          path="/user"
          element={
            <ProtectedRoute role="USER" user={user}>
              <UserPage logout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN" user={user}>
              <AdminPage logout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ticket-checker"
          element={
            <ProtectedRoute role="TICKET_CHECKER" user={user}>
              <CheckerPage logout={logout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute role="USER" user={user}>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/book/:eventId"
          element={
            <ProtectedRoute role="USER" user={user}>
              <BookingPage />
            </ProtectedRoute>
          }
        />

        <Route path="/checker" element={<CheckerPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
