import { useEffect, useState, useRef } from "react";
import { getAgentLogs } from "../services/sessionService";
import { useAuth } from "../context/AuthProvider";
import { PieChart, BarChart } from "@mui/x-charts";

/* ---------------- EMOTION MAP ---------------- */
const emotionMap = {
  happiness: { label: "Happiness", emoji: "😊", color: "#22d3ee" },
  surprise: { label: "Surprise", emoji: "😲", color: "#a78bfa" },
  sadness: { label: "Sadness", emoji: "😢", color: "#60a5fa" },
  fear: { label: "Fear", emoji: "😨", color: "#fbbf24" },
  disgust: { label: "Disgust", emoji: "🤢", color: "#4ade80" },
  anger: { label: "Anger", emoji: "😠", color: "#f87171" },
  neutral: { label: "Neutral", emoji: "😐", color: "#9ca3af" },
};

/* ---------------- FAKE DATA ---------------- */

// Outcome (GLOBAL)
const fakeOutcomeData = [
  { id: "resolved", label: "Resolved", value: 60 },
  { id: "pending", label: "Pending", value: 25 },
  { id: "escalated", label: "Escalated", value: 15 },
];

// Emotion (SESSION)
const fakeEmotionData = [
  { key: "happiness", value: 7 },
  { key: "surprise", value: 5 },
  { key: "sadness", value: 5 },
  { key: "fear", value: 4 },
  { key: "disgust", value: 4 },
  { key: "anger", value: 3 },
  { key: "neutral", value: 1 },
];

export default function AgentDashboard() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const fetchedRef = useRef(false);

  /* ---------------- FETCH LOGS ---------------- */
  useEffect(() => {
    if (!user?.id || fetchedRef.current) return;
    fetchedRef.current = true;

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
  }, [user?.id]);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        📋 Your Completed Sessions
      </h2>

      {/* ================= MAIN GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* ================= LEFT: SESSION CARDS ================= */}
        <div className="lg:col-span-1 space-y-6">
          {logs.map((log) => (
            <div
              key={log.session_id}
              className="p-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-lg hover:scale-[1.02] transition"
            >
              <div className="flex justify-between mb-2">
                <p className="font-semibold">👤 {log.customer_name}</p>
                <p className="text-gray-300">#{log.session_id}</p>
              </div>

              <p className="text-sm">
                🕓 {log.start_time} → {log.end_time}
              </p>
              <p className="text-sm">🏷️ {log.intent_classified || "—"}</p>

              <button
                onClick={() => setSelectedLog(log)}
                className="mt-4 px-4 py-1.5 bg-cyan-600 rounded-full text-sm hover:bg-cyan-700 transition"
              >
                🗂 View Messages
              </button>
            </div>
          ))}
        </div>

        {/* ================= RIGHT: ANALYTICS ================= */}
        <div className="lg:col-span-2 space-y-10">
          {/* -------- Outcome Distribution -------- */}
          <div className="rounded-2xl p-6 bg-gradient-to-br from-slate-700/40 to-slate-800/60 border border-white/20 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">
              📊 Outcome Distribution
            </h3>

            <div className="flex items-center justify-evenly">
              <div>
                <PieChart
                  series={[
                    {
                      data: fakeOutcomeData,
                      innerRadius: 80,
                      outerRadius: 130,
                      paddingAngle: 4,
                      cornerRadius: 10,
                    },
                  ]}
                  colors={["#3b82f6", "#facc15", "#ef4444"]}
                  height={320}
                  slotProps={{
                    legend: { hidden: true }, // 🚀 important
                  }}
                />
              </div>

              {/* Custom Legend */}
              <div className="space-y-3 ml-6">
                {fakeOutcomeData.map((o, i) => (
                  <div key={o.id} className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: ["#3b82f6", "#facc15", "#ef4444"][i],
                      }}
                    />
                    <span className="flex-1">{o.label}</span>
                    <span className="font-semibold">{o.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* -------- Emotion Distribution -------- */}
          <div className="rounded-2xl p-6 bg-gradient-to-br from-slate-700/40 to-slate-800/60 border border-white/20 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">
              😊 Emotion Distribution
            </h3>

            <BarChart
              xAxis={[
                {
                  scaleType: "band",
                  data: fakeEmotionData.map(
                    (e) =>
                      `${emotionMap[e.key].emoji} ${emotionMap[e.key].label}`
                  ),
                  tickLabelStyle: {
                    fill: "#e5e7eb",
                    fontSize: 12,
                  },
                  axisLine: { stroke: "#9ca3af" },
                  tickLine: { stroke: "#9ca3af" },
                  categoryGap: 0.5,
                },
              ]}
              yAxis={[
                {
                  tickLabelStyle: {
                    fill: "#e5e7eb",
                    fontSize: 12,
                  },
                  axisLine: { stroke: "#9ca3af" },
                  tickLine: { stroke: "#9ca3af" },
                },
              ]}
              series={fakeEmotionData.map((emotion, index) => ({
                label: emotionMap[emotion.key].label,
                data: fakeEmotionData.map((_, i) =>
                  i === index ? emotion.value : null
                ),
                color: emotionMap[emotion.key].color,
                valueFormatter: (v) => (v ? v : ""),
              }))}
              height={340}
              grid={{
                horizontal: true,
                stroke: "#334155",
              }}
              barGap={0.15}
              slotProps={{
                legend: { hidden: true },
                bar: {
                  rx: 6,
                  ry: 6,
                  barWidth: 28,
                  label: {
                    position: "top",
                    fill: "#ffffff",
                    fontSize: 12,
                    fontWeight: 600,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* ================= CHAT MODAL ================= */}
      {selectedLog && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedLog(null)}
              className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-red-500 transition"
            >
              ✖
            </button>

            <h3 className="text-xl font-semibold mb-6 text-center">
              💬 Chat History with {selectedLog.customer_name}
            </h3>

            <div className="space-y-4">
              {selectedLog.messages?.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.sender === "agent" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm
                      ${
                        msg.sender === "agent"
                          ? "bg-gradient-to-br from-cyan-600 to-blue-600 rounded-br-sm"
                          : "bg-gradient-to-br from-gray-700 to-gray-600 rounded-bl-sm"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 reminding mb-1 text-xs opacity-90">
                      <span>
                        {msg.sender === "agent" ? "👨‍💼 Agent" : "🙋 Customer"}
                      </span>
                      <span className="ml-auto px-2 py-0.5 rounded-full bg-black/20">
                        {emotionMap[msg.emotion]?.emoji}{" "}
                        {emotionMap[msg.emotion]?.label}
                      </span>
                    </div>

                    <p className="whitespace-pre-wrap break-words">
                      {msg.text}
                    </p>
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
