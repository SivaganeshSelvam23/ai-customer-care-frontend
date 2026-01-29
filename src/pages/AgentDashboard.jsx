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

/* ---------------- ENTITY AGGREGATOR ---------------- */
const extractEntitiesFromMessages = (messages = []) => {
  return messages.reduce((acc, msg) => {
    if (msg.entities && typeof msg.entities === "object") {
      Object.entries(msg.entities).forEach(([key, value]) => {
        if (value && !acc[key]) {
          acc[key] = value; // keep first occurrence
        }
      });
    }
    return acc;
  }, {});
};

/* ---------------- ENTITY LABELS ---------------- */
const entityLabels = {
  order_number: "Order #",
  product_id: "Product ID",
  product_name: "Product",
  quantity: "Qty",
  customer_name: "Customer",
  email: "Email",
  phone: "Phone",
  payment_method: "Payment",
  transaction_id: "Transaction",
  refund_id: "Refund ID",
  return_reason: "Reason",
  delivery_status: "Delivery",
  coupon_code: "Coupon",
  loyalty_points: "Points",
  subscription_plan: "Plan",
  complaint_type: "Complaint",
  product_category: "Category",
  store_location: "Store",
  amount: "Amount",
  refund_amount: "Refund Amount",
};
const entityStyleMap = {
  order_number: "bg-blue-500/20 text-blue-300 border-blue-400/40",
  product_id: "bg-green-500/20 text-green-300 border-green-400/40",
  product_name: "bg-green-500/20 text-green-300 border-green-400/40",
  quantity: "bg-green-500/20 text-green-300 border-green-400/40",

  customer_name: "bg-violet-500/20 text-violet-300 border-violet-400/40",
  email: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
  phone: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",

  payment_method: "bg-amber-500/20 text-amber-300 border-amber-400/40",
  transaction_id: "bg-amber-500/20 text-amber-300 border-amber-400/40",
  refund_id: "bg-amber-500/20 text-amber-300 border-amber-400/40",

  delivery_address: "bg-orange-500/20 text-orange-300 border-orange-400/40",
  shipping_method: "bg-orange-500/20 text-orange-300 border-orange-400/40",
  delivery_status: "bg-orange-500/20 text-orange-300 border-orange-400/40",

  account_id: "bg-purple-500/20 text-purple-300 border-purple-400/40",
  username: "bg-purple-500/20 text-purple-300 border-purple-400/40",
  subscription_plan: "bg-purple-500/20 text-purple-300 border-purple-400/40",

  amount: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
  refund_amount: "bg-rose-500/20 text-rose-300 border-rose-400/40",
  date: "bg-slate-500/20 text-slate-300 border-slate-400/40",
  time: "bg-slate-500/20 text-slate-300 border-slate-400/40",
};

function EntityPanel({ entities }) {
  const [expanded, setExpanded] = useState(false);

  const entries = Object.entries(entities || {});
  const visible = expanded ? entries : entries.slice(0, 5);
  const hiddenCount = entries.length - 5;

  return (
    <div className="mt-4 p-4 rounded-2xl bg-slate-900/60 border border-white/10">
      <p className="text-xs font-semibold text-gray-300 mb-3 flex items-center gap-2">
        🧠 Entities (NER)
      </p>

      {/* -------- FALLBACK UI -------- */}
      {entries.length === 0 ? (
        <div className="text-xs text-gray-400 italic flex items-center gap-2">
          ⚠️ No entities detected in this session
        </div>
      ) : (
        <>
          <div
            className={`flex flex-wrap gap-2 ${
              expanded ? "max-h-40 overflow-y-auto entity-scroll pr-2" : ""
            }`}
          >
            {visible.map(([key, value]) => (
              <span
                key={key}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium
                  ${
                    entityStyleMap[key] ||
                    "bg-gray-500/20 text-gray-300 border-gray-400/30"
                  }
                `}
              >
                <strong>{entityLabels[key] || key}:</strong>{" "}
                <span className="opacity-90">{String(value)}</span>
              </span>
            ))}
          </div>

          {hiddenCount > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
            >
              {expanded ? "Show less" : `+${hiddenCount} more`}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default function AgentDashboard() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [dashboard, setDashboard] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const fetchedRef = useRef(false);

  const outcomeStyles = {
    pending:
      "bg-yellow-500/20 text-yellow-400 border border-yellow-400/40 shadow-yellow-500/20 shadow-sm",
    resolved:
      "bg-green-500/20 text-green-400 border border-green-400/40 shadow-blue-500/20 shadow-sm",
    escalated:
      "bg-red-500/20 text-red-400 border border-red-400/40 shadow-red-500/20 shadow-sm",
  };

  /* ---------------- FETCH LOGS ---------------- */
  useEffect(() => {
    if (!user?.id || fetchedRef.current) return;
    fetchedRef.current = true;

    getAgentLogs(user.id)
      .then((res) => {
        // 🔑 backend structure handling
        setLogs(res?.card || []);
        setDashboard(res?.dashboard || []);
      })
      .catch(console.error);
  }, [user?.id]);

  /* ---------------- DASHBOARD HELPERS ---------------- */
  const getDashboardData = (type) =>
    dashboard.find((d) => d.type === type)?.data || [];

  const outcomeSummary =
    dashboard.find((d) => d.type === "overall_outcome_summary")?.data || [];

  const outcomeColors = {
    resolved: "#59AC77",
    pending: "#facc15",
    escalated: "#ef4444",
  };

  const mappedOutcomeData = outcomeSummary.map((o) => ({
    id: o.key,
    label: o.key.charAt(0).toUpperCase() + o.key.slice(1),
    value: o.value,
  }));
  const agentEmotionSummary =
    dashboard.find((d) => d.type === "overall_agent_emotion_summary")?.data ||
    [];

  const customerEmotionSummary =
    dashboard.find((d) => d.type === "overall_customer_emotion_summary")
      ?.data || [];

  // Ensure consistent emotion ordering
  const orderedEmotions = Object.keys(emotionMap);

  const mapEmotionData = (summary) =>
    orderedEmotions.map((key) => ({
      key,
      value: summary.find((e) => e.key === key)?.value || 0,
    }));

  const agentEmotionData = mapEmotionData(agentEmotionSummary);
  const customerEmotionData = mapEmotionData(customerEmotionSummary);

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
              {/* -------- ENTITY PANEL -------- */}
              <EntityPanel
                entities={extractEntitiesFromMessages(log.messages)}
              />
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
            <h3 className="text-2xl font-semibold mb-4">
              📊 Overall Outcome Distribution
            </h3>

            <div className="flex items-center justify-evenly">
              <div>
                <PieChart
                  series={[
                    {
                      data: mappedOutcomeData,
                      innerRadius: 80,
                      outerRadius: 130,
                      paddingAngle: 4,
                      cornerRadius: 10,
                    },
                  ]}
                  colors={mappedOutcomeData.map((o) => outcomeColors[o.id])}
                  height={320}
                  slotProps={{
                    legend: { hidden: true },
                  }}
                />
              </div>

              {/* Custom Legend */}
              <div className="space-y-3 ml-6">
                {mappedOutcomeData.map((o) => (
                  <div key={o.id} className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: outcomeColors[o.id] }}
                    />
                    <span className="flex-1">{o.label}</span>
                    <span className="font-semibold">{o.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* -------- Emotion Distribution -------- */}
          <div className="rounded-2xl p-6 bg-gradient-to-br from-slate-700/40 to-slate-800/60 border border-white/20 shadow-xl">
            <h3 className="text-2xl font-semibold mb-4">
              👨‍💼 Emotion Distribution Of Agent
            </h3>

            <BarChart
              xAxis={[
                {
                  scaleType: "band",
                  data: agentEmotionData.map(
                    (e) =>
                      `${emotionMap[e.key].emoji} ${emotionMap[e.key].label}`,
                  ),
                  tickLabelStyle: {
                    fill: "#e5e7eb",
                    fontSize: 13,
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
                    fontSize: 14,
                  },
                  axisLine: { stroke: "#9ca3af" },
                  tickLine: { stroke: "#9ca3af" },
                },
              ]}
              series={agentEmotionData.map((emotion, index) => ({
                label: emotionMap[emotion.key].label,
                data: agentEmotionData.map((_, i) =>
                  i === index ? emotion.value : null,
                ),
                color: emotionMap[emotion.key].color,
                valueFormatter: (v) => (v ? v : ""),
              }))}
              height={340}
              grid={{
                horizontal: false,
                stroke: "#334155",
              }}
              bargap={0.15}
              slotProps={{
                legend: { hidden: true },
                bar: {
                  rx: 6,
                  ry: 6,
                  barwidth: 28,
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
          <div className="rounded-2xl p-6 bg-gradient-to-br from-slate-700/40 to-slate-800/60 border border-white/20 shadow-xl">
            <h3 className="text-2xl font-semibold mb-4">
              🙋 Emotion Distribution Of Customer
            </h3>

            <BarChart
              xAxis={[
                {
                  scaleType: "band",
                  data: customerEmotionData.map(
                    (e) =>
                      `${emotionMap[e.key].emoji} ${emotionMap[e.key].label}`,
                  ),
                  tickLabelStyle: {
                    fill: "#e5e7eb",
                    fontSize: 13,
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
                    fontSize: 14,
                  },
                  axisLine: { stroke: "#9ca3af" },
                  tickLine: { stroke: "#9ca3af" },
                },
              ]}
              series={customerEmotionData.map((emotion, index) => ({
                label: emotionMap[emotion.key].label,
                data: customerEmotionData.map((_, i) =>
                  i === index ? emotion.value : null,
                ),
                color: emotionMap[emotion.key].color,
                valueFormatter: (v) => (v ? v : ""),
              }))}
              height={340}
              grid={{
                horizontal: false,
                stroke: "#334155",
              }}
              bargap={0.15}
              slotProps={{
                legend: { hidden: true },
                bar: {
                  rx: 6,
                  ry: 6,
                  barwidth: 28,
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
            className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] 
             overflow-y-auto chat-scroll shadow-2xl relative text-white"
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
