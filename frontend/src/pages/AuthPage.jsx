import { useState } from "react";
import { login, register, handleApiError } from "../api";
import { useNavigate } from "react-router-dom";

export default function AuthPage({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      if (isLogin) {
        const response = await login({
          email: formData.email,
          password: formData.password,
        });

        // Extract user data and token
        const userData = response.data.user || response.data;
        const token =
          response.data.token || response.data.jwt || response.data.accessToken;

        if (!token) {
          throw new Error("Authentication failed - no token received");
        }

        const userToStore = {
          ...userData,
          token,
          role: userData.role,
        };

        localStorage.setItem("user", JSON.stringify(userToStore));
        setUser(userToStore);

        // Redirect based on role
        const redirectPath =
          {
            ADMIN: "/admin",
            TICKET_CHECKER: "/ticket-checker",
            USER: "/user",
          }[userData.role] || "/user";

        navigate(redirectPath);
      } else {
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });

        setMessage({
          type: "success",
          text: "Registration successful! Please login.",
        });
        setIsLogin(true);
        setFormData({ ...formData, password: "" });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: handleApiError(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setMessage({ type: "", text: "" });
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "USER",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-red-700 via-orange-600 to-yellow-500">
      <div className="bg-black text-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">
          {isLogin ? "Welcome Back !" : "Create Account"}
        </h2>
        <p className="text-gray-400 text-center mb-8">
          {isLogin ? "Login to access your account" : "Sign up to get started"}
        </p>

        {message.text && (
          <div
            className={`p-4 rounded-lg mb-6 text-center ${
              message.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-white text-black placeholder-gray-600 focus:ring-2 focus:ring-gray-200 focus:outline-none"
              />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-white text-black focus:ring-2 focus:ring-gray-200 focus:outline-none"
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
                <option value="TICKET_CHECKER">Ticket Checker</option>
              </select>
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg bg-white text-black placeholder-gray-600 focus:ring-2 focus:ring-gray-200 focus:outline-none"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            className="w-full p-3 rounded-lg bg-white text-black placeholder-gray-600 focus:ring-2 focus:ring-gray-200 focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-lg transition ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={toggleMode}
            className="text-yellow-400 hover:text-yellow-400 font-semibold bg-transparent border-none"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
