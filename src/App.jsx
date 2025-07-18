// src/App.jsx
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthForm from "./components/AuthForm";
import Layout from "./components/Layout";
import AdminDashboard from "./pages/AdminDashboard";
import AgentDashboard from "./pages/AgentDashboard";

function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/" element={<AuthForm />} />
      <Route path="/unauthorized" element={<p>Unauthorized</p>} />

      {/* Protected Routes nested inside Layout */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["admin", "agent", "customer"]} />
        }
      >
        <Route element={<Layout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/agent" element={<AgentDashboard />} />
          <Route path="/customer" element={<p>Customer Dashboard</p>} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<p>Not Found</p>} />
    </Routes>
  );
}

export default App;
