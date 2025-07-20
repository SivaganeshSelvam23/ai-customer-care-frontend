import { useEffect, useState } from "react";
import { getAgentLogs } from "../services/sessionService";
import { useAuth } from "../context/AuthProvider";

const emotionMap = {
  0: { label: "Neutral", emoji: "😐" },
  1: { label: "Anger", emoji: "😠" },
  2: { label: "Disgust", emoji: "🤢" },
  3: { label: "Fear", emoji: "😨" },
  4: { label: "Happiness", emoji: "😊" },
  5: { label: "Sadness", emoji: "😢" },
  6: { label: "Surprise", emoji: "😲" },
};

export default function AgentDashboard() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    if (user?.id) {
      getAgentLogs(user.id)
        .then((data) => {
          const parsed = data.map((log) => ({
            ...log,
            messages:
              typeof log.messages === "string"
                ? JSON.parse(log.messages)
                : log.messages,
          }));
          setLogs(parsed);
        })
        .catch(console.error);
    }
  }, [user]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-white">
        📋 Your Completed Sessions
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {logs.map((log) => (
          <div
            key={log.session_id}
            className="p-6 rounded-xl shadow-lg bg-white/10 border border-white/20 backdrop-blur-sm text-white transition-transform transform hover:scale-[1.02] w-full"
          >
            <div className="flex justify-between items-center mb-2">
              <p className="text-lg font-semibold truncate">
                👤 {log.customer_name}
              </p>
              <p className="text-sm text-gray-300">#{log.session_id}</p>
            </div>

            <p>
              ✅ <strong>Outcome:</strong> {log.outcome}
            </p>
            <p>
              🕓 <strong>Time:</strong> {log.start_time} → {log.end_time}
            </p>
            <p>
              🏷️ <strong>NER:</strong> {log.ner_summary || "—"}
            </p>

            <button
              onClick={() => setSelectedLog(log)}
              className="mt-3 px-4 py-1 bg-cyan-600 hover:bg-cyan-700 rounded-full text-sm"
            >
              🗂 View Messages
            </button>
          </div>
        ))}
      </div>

      {/* Modal for message history */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setSelectedLog(null)}
              className="absolute top-2 right-2 text-xl text-gray-600 dark:text-gray-300 hover:text-red-500"
            >
              ✖
            </button>
            <h3 className="text-lg font-bold mb-4 text-center">
              🗨️ Chat History with {selectedLog.customer_name}
            </h3>
            <div className="space-y-3">
              {selectedLog.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-gray-100 dark:bg-gray-700 rounded"
                >
                  <div className="flex justify-between">
                    <span>
                      {msg.sender === "agent" ? "👨‍💼" : "🙋"}{" "}
                      <strong>{msg.text}</strong>
                    </span>
                    <span className="text-xs text-gray-500">
                      {msg.timestamp}
                    </span>
                  </div>
                  <div className="text-green-600 dark:text-green-400 mt-1">
                    {emotionMap[msg.emotion]?.emoji}{" "}
                    {emotionMap[msg.emotion]?.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
