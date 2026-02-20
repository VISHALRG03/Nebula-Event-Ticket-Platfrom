import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, lazy, Suspense } from "react"; // Removed useEffect
import "./App.css";

// Lazy load pages for better performance
const AuthPage = lazy(() => import("./pages/AuthPage"));
const UserPage = lazy(() => import("./pages/UserPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const CheckerPage = lazy(() => import("./pages/CheckerPage"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const BookingPage = lazy(() => import("./pages/BookingPage"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-black">
    <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent"></div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles, user }) => {
  if (!user) return <Navigate to="/" replace />;

  const userRole = user.role || user.user?.role;

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<AuthPage setUser={setUser} />} />

          <Route
            path="/user"
            element={
              <ProtectedRoute allowedRoles={["USER"]} user={user}>
                <UserPage logout={logout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]} user={user}>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ticket-checker"
            element={
              <ProtectedRoute allowedRoles={["TICKET_CHECKER"]} user={user}>
                <CheckerPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute allowedRoles={["USER"]} user={user}>
                <MyBookings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/book/:eventId"
            element={
              <ProtectedRoute allowedRoles={["USER"]} user={user}>
                <BookingPage />
              </ProtectedRoute>
            }
          />

          {/* 404 Page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
