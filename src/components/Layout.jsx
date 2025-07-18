// src/components/Layout.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaComments,
  FaChartBar,
  FaBell,
  FaUsers,
} from "react-icons/fa";
import ChatComponent from "../components/ChatComponent";

const navItems = {
  admin: [
    { name: "Dashboard", icon: <FaChartBar /> },
    { name: "Users", icon: <FaUsers /> },
    { name: "Reports", icon: <FaChartBar /> },
  ],
  agent: [
    { name: "Dashboard", icon: <FaChartBar /> },
    { name: "Notifications", icon: <FaBell /> },
  ],
  customer: [
    { name: "Dashboard", icon: <FaChartBar /> },
    { name: "Chat", icon: <FaComments /> },
  ],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState("Dashboard");
  const [notificationCount, setNotificationCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  useEffect(() => {
    if (active === "Notifications") {
      setNotificationCount(0);
    }
  }, [active]);
  const renderContent = () => {
    switch (active) {
      case "Dashboard":
        return <p>Welcome, {user.name}! This is your dashboard.</p>;
      case "Users":
        return <p>User management panel.</p>;
      case "Reports":
        return <p>View system reports.</p>;
      case "Notifications":
        return <p>You have {notificationCount} new notifications.</p>;
      case "Chat":
        return <ChatComponent />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Side Nav */}
      <aside className="w-64 bg-cyan-950 text-white p-4">
        <h2 className="text-xl font-bold mb-6">Logo</h2>
        <nav className="space-y-2">
          {navItems[user?.role]?.map(({ name, icon }) => (
            <button
              key={name}
              onClick={() => setActive(name)}
              className={`flex items-center gap-2 w-full px-2 py-1 rounded ${
                active === name ? "bg-cyan-800" : "hover:bg-cyan-800"
              }`}
            >
              {icon}
              {name}
              {name === "Notifications" && notificationCount > 0 && (
                <span className="ml-auto bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {notificationCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
        <header className="bg-white dark:bg-gray-800 p-4 shadow flex justify-between items-center">
          <h1 className="text-lg font-semibold">AI Customer Support</h1>
          <div className="flex items-center justify-between">
            <div className="flex mr-2 items-center">
              <FaUser /> <span className="ml-1">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white"
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
