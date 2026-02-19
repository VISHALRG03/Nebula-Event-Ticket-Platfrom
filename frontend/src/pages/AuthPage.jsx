import { useState } from "react";
import { login, register } from "../api";
import { useNavigate } from "react-router-dom";

// receive setUser from App
export default function AuthPage({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("USER");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        const res = await login({ email, password });

        // Save to localStorage
        localStorage.setItem("user", JSON.stringify(res.data));

        // Update App state dynamically
        setUser(res.data);

        // Redirect based on role
        const userRole = res.data.user.role;
        if (userRole === "ADMIN") navigate("/admin");
        else if (userRole === "TICKET_CHECKER") navigate("/ticket-checker");
        else navigate("/user");
      } else {
        await register({ name, email, password, role });
        setIsLogin(true); // switch to login after registration
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(180deg, #ff0057 0%, #ff7a00 50%, #ffd000 100%)",
      }}
    >
      <div className="bg-black text-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        {/* <h2 className="text-3xl font-bold mb-2 text-center text-white">
          Welcome to Event Tickets
        </h2> */}

        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? "Login" : "Register"}
        </h2>

        {error && (
          <p className="bg-red-600 text-white p-3 rounded mb-4 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-black">
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-3 rounded bg-gray-100 text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-gray-100 mt-4"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-3 rounded bg-gray-100 text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-gray-100"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="TICKET_CHECKER">TICKET_CHECKER</option>
              </select>
            </>
          )}

          <input
            type="email"
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 rounded bg-white text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-gray-100"
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 rounded bg-white text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-gray-100"
          />

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold p-3 rounded transition duration-200"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-white hover:text-blue-500 font-semibold bg-transparent border-none cursor-pointer"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
