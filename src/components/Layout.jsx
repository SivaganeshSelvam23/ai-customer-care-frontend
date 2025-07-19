// Layout.jsx
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
import { getAssignedSessions, startSession } from "../services/sessionService";

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
  const [chatProps, setChatProps] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState("Dashboard");
  const [notificationCount, setNotificationCount] = useState(0);
  const [assignedSessions, setAssignedSessions] = useState([]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    if (user?.role === "agent") {
      const interval = setInterval(async () => {
        try {
          const sessions = await getAssignedSessions(user.id);
          setNotificationCount(sessions?.length || 0);
          setAssignedSessions(sessions || []);
        } catch (err) {
          console.error("Error fetching sessions", err);
          setNotificationCount(0);
          setAssignedSessions([]);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const handleStartNewChat = async () => {
    try {
      const session = await startSession(user.id);
      setChatProps({
        sessionId: session.session_id,
        chatWith: session.agent_name,
      });
    } catch (err) {
      console.error("Failed to start new session", err);
    }
  };

  const renderContent = () => {
    switch (active) {
      case "Dashboard":
        return <p>Welcome, {user.name}! This is your dashboard.</p>;
      case "Users":
        return <p>User management panel.</p>;
      case "Reports":
        return <p>View system reports.</p>;
      case "Notifications":
        return (
          <div>
            <p className="mb-2">
              You have {notificationCount} new notification(s).
            </p>
            {assignedSessions.length > 0 ? (
              assignedSessions.map((s) => (
                <div
                  key={s.session_id}
                  className="p-2 border rounded bg-white dark:bg-gray-700 mb-4"
                >
                  <p>
                    💬 You are assigned to <strong>{s.customer_name}</strong>
                  </p>
                  <p>🕓 Started at: {s.started_at}</p>
                  <button
                    onClick={() =>
                      setChatProps({
                        sessionId: s.session_id,
                        chatWith: s.customer_name,
                      })
                    }
                    className="mt-2 px-3 py-1 bg-blue-600 text-white rounded"
                  >
                    Open Chat
                  </button>
                </div>
              ))
            ) : (
              <p>No active sessions assigned.</p>
            )}

            {/* Mount chat below only if opened */}
            {chatProps && user.role === "agent" && (
              <ChatComponent
                sessionIdProp={chatProps.sessionId}
                chatWithProp={chatProps.chatWith}
                onEnd={() => setChatProps(null)}
              />
            )}
          </div>
        );
      case "Chat":
        return chatProps ? (
          <ChatComponent
            sessionIdProp={chatProps.sessionId}
            chatWithProp={chatProps.chatWith}
            onEnd={() => setChatProps(null)}
          />
        ) : (
          <div>
            {/* <p className="text-gray-500 italic mb-4">Chat has ended.</p> */}
            {user.role === "customer" && (
              <button
                onClick={handleStartNewChat}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Start New Chat
              </button>
            )}
          </div>
        );
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
