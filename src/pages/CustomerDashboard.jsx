import { useEffect, useState, useRef } from "react";
import { getAgentLogs } from "../services/sessionService";
import { useAuth } from "../context/AuthProvider";

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const fetchedRef = useRef(false);

  const outcomeStyles = {
    pending:
      "bg-yellow-500/20 text-yellow-400 border border-yellow-400/40 shadow-sm",
    resolved:
      "bg-green-500/20 text-green-400 border border-green-400/40 shadow-sm",
    escalated: "bg-red-500/20 text-red-400 border border-red-400/40 shadow-sm",
  };

  useEffect(() => {
    if (!user?.id || fetchedRef.current) return;
    fetchedRef.current = true;

    getAgentLogs(user.id)
      .then((res) => {
        setLogs(res?.card || []);
      })
      .catch(console.error);
  }, [user?.id]);

  /* ================= EMPTY STATE ================= */
  if (!logs.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center text-gray-300">
        <div className="text-6xl mb-4">💬</div>
        <h2 className="text-2xl font-semibold mb-2">No sessions yet</h2>
        <p className="max-w-md text-sm text-gray-400">
          You haven’t started any customer support sessions yet. Once you begin
          a chat, your completed sessions will appear here.
        </p>
      </div>
    );
  }

  /* ================= SESSION CARDS ================= */
  return (
    <div className="lg:col-span-1 space-y-6">
      {logs.map((log) => (
        <div
          key={log.session_id}
          className="p-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-lg hover:scale-[1.02] transition"
        >
          <div className="flex justify-between items-center mb-2">
            <p className="text-lg font-semibold truncate">
              👤 {log.customer_name}
            </p>
            <p className="text-gray-300">#{log.session_id}</p>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <span>
              ✅ <strong>Outcome:</strong>
            </span>
            <span
              className={`px-3 py-0.5 rounded-full text-xs font-semibold capitalize ${
                outcomeStyles[log.outcome] || "bg-gray-500/20 text-gray-300"
              }`}
            >
              {log.outcome}
            </span>
          </div>

          <p className="text-sm">
            🕓 <strong>Time:</strong> {log.start_time} → {log.end_time}
          </p>

          <p className="text-sm">
            🏷️ <strong>Intent:</strong> {log.intent_classified || "—"}
          </p>
        </div>
      ))}
    </div>
  );
};

export default CustomerDashboard;
