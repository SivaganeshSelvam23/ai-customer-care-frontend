import { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaChartPie,
  FaUsers,
  FaFileAlt,
  FaBell,
  FaComments,
} from "react-icons/fa";

const navItems = {
  admin: [
    { label: "Dashboard", icon: <FaChartPie /> },
    { label: "Users", icon: <FaUsers /> },
    { label: "Reports", icon: <FaFileAlt /> },
  ],
  agent: [
    { label: "Dashboard", icon: <FaChartPie /> },
    { label: "Notifications", icon: <FaBell /> },
  ],
  customer: [
    { label: "Dashboard", icon: <FaChartPie /> },
    { label: "Chat", icon: <FaComments /> },
  ],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState("Dashboard");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const renderContent = () => {
    switch (active) {
      case "Dashboard":
        return <p>This is the {user.role} Dashboard</p>;
      case "Users":
        return <p>Manage Users</p>;
      case "Reports":
        return <p>Reports Page</p>;
      case "Notifications":
        return <p>Your Notifications</p>;
      case "Chat":
        return <p>Start Chatting</p>;
      default:
        return <p>Welcome, {user.name}!</p>;
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Side Nav */}
      <aside className="w-64 bg-cyan-950 text-white p-4">
        <h3 className="text-xl font-bold mb-6">Support Panel</h3>
        <nav className="space-y-2">
          {navItems[user?.role]?.map(({ label, icon }) => (
            <button
              key={label}
              onClick={() => setActive(label)}
              className={`flex items-center gap-2 w-full px-3 py-2 rounded text-left ${
                active === label ? "bg-cyan-800" : "hover:bg-cyan-800"
              }`}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
        <header className="bg-white dark:bg-gray-800 p-4 shadow flex justify-between items-center">
          <h1 className="text-lg font-semibold">AI Customer Support</h1>
          <div className="flex items-center justify-between">
            <div className="flex mr-5 items-center">
              <FaUser /> <span className="ml-1">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-cyan-900 hover:bg-cyan-700 px-3 py-1 rounded text-white"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="p-6">{renderContent()}</section>
      </main>
    </div>
  );
}
