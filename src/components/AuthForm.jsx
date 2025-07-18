import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { loginUser, registerUser } from "../services/AuthService";

export default function AuthForm() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (mode === "login") {
        const data = await loginUser(form.username, form.password);
        login(data.user, data.token); // ✅ update context
        setSuccess("Login successful!");

        // Navigate to role-based route
        const role = data.user.role;
        navigate(`/${role}`);
      } else {
        await registerUser(form.name, form.username, form.password);
        setSuccess("Registration successful! Please login.");
        setMode("login");
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Login failed.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-gray-100">
          {mode === "login" ? "Login" : "Register"}
        </h2>

        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        {success && (
          <div className="text-green-500 text-sm mb-2">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-2 rounded border dark:bg-gray-700"
              required
            />
          )}

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full p-2 rounded border dark:bg-gray-700"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-2 rounded border dark:bg-gray-700"
            required
          />

          <button
            type="submit"
            className="w-full bg-violet-700 hover:bg-violet-800 text-white py-2 px-4 rounded"
          >
            {mode === "login" ? "Login" : "Register"}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-300">
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <button
            type="button"
            className="text-violet-400 hover:underline"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Register here" : "Login here"}
          </button>
        </p>
      </div>
    </div>
  );
}
