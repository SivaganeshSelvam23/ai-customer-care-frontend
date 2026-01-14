// ChatComponent.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import {
  startSession,
  getMessages,
  sendMessage,
  endSession as apiEndSession,
} from "../services/sessionService";

/* ---------------- EMOTION MAP ---------------- */
const emotionMap = {
  no_emotion: { label: "neutral", emoji: "😐" },
  anger: { label: "anger", emoji: "😠" },
  disgust: { label: "disgust", emoji: "🤢" },
  fear: { label: "fear", emoji: "😨" },
  happiness: { label: "happiness", emoji: "😊" },
  sadness: { label: "sadness", emoji: "😢" },
  surprise: { label: "surprise", emoji: "😲" },
};

/* ---------------- ENTITY COLOR MAP ---------------- */
const entityColorMap = {
  "Order Number": "bg-blue-400/30 text-blue-200",
  "Refund Amount": "bg-green-400/30 text-green-200",
  Amount: "bg-green-400/30 text-green-200",
  Product: "bg-teal-400/30 text-teal-200",
  Quantity: "bg-teal-400/30 text-teal-200",
  Email: "bg-cyan-400/30 text-cyan-200",
  Phone: "bg-cyan-400/30 text-cyan-200",
  "Transaction ID": "bg-amber-400/30 text-amber-200",
  "Refund ID": "bg-amber-400/30 text-amber-200",
};

/* ---------------- SAFE ENTITY PARSER ---------------- */
const parseEntities = (entities) => {
  if (!entities || entities === "no entities extracted or detected") {
    return [];
  }

  try {
    return JSON.parse(entities);
  } catch (e) {
    console.error("Failed to parse entities:", entities);
    return [];
  }
};

/* ---------------- ENTITY HIGHLIGHTER ---------------- */
const highlightEntities = (text, entities) => {
  if (!entities.length) return text;

  let highlightedText = text;

  entities.forEach(({ label, text: entityText }) => {
    if (!entityText) return;

    const escaped = entityText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const regex = new RegExp(`(${escaped})`, "gi");

    const colorClass =
      entityColorMap[label] || "bg-yellow-400/30 text-yellow-200";

    highlightedText = highlightedText.replace(
      regex,
      `<span class="${colorClass} px-1 rounded font-semibold">$1</span>`
    );
  });

  return highlightedText;
};

/* ---------------- MAIN COMPONENT ---------------- */
const ChatComponent = ({ sessionIdProp, chatWithProp, onEnd }) => {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState(sessionIdProp || null);
  const [chatWith, setChatWith] = useState(chatWithProp || "");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionEnded, setSessionEnded] = useState(false);

  /* -------- LOAD SESSION -------- */
  useEffect(() => {
    const loadSession = async () => {
      try {
        if (user?.role === "customer") {
          const session = await startSession(user.id);
          setSessionId(session.session_id);
          setChatWith(session.agent_name);

          const initialMessages = await getMessages(session.session_id);
          setMessages(initialMessages);
        } else if (user?.role === "agent" && sessionIdProp) {
          setSessionId(sessionIdProp);
          setChatWith(chatWithProp);

          const initialMessages = await getMessages(sessionIdProp);
          setMessages(initialMessages);
        }
      } catch (err) {
        console.error("Failed to load session:", err);
      }
    };

    loadSession();
  }, [user, sessionIdProp, chatWithProp]);

  /* -------- POLLING -------- */
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!sessionId) return;

      try {
        const updatedMessages = await getMessages(sessionId);
        setMessages(updatedMessages);
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [sessionId]);

  /* -------- SEND MESSAGE -------- */
  const handleSend = async () => {
    if (!input.trim()) return;

    try {
      await sendMessage({
        session_id: sessionId,
        sender_id: user.id,
        sender: user.role,
        text: input.trim(),
      });

      const updatedMessages = await getMessages(sessionId);
      setMessages(updatedMessages);
      setInput("");
    } catch (err) {
      console.error("Send failed:", err);
    }
  };

  /* -------- END CHAT -------- */
  const handleEndChat = async () => {
    try {
      await apiEndSession(sessionId, user.id);
      setSessionEnded(true);
      if (onEnd) onEnd();
    } catch (err) {
      console.error("End session failed:", err);
    }
  };

  return (
    <div className="mt-4">
      {chatWith && (
        <p className="text-sm mb-2 text-gray-600">
          {user.role === "customer"
            ? "👨‍💼 You are chatting with"
            : "👤 You are chatting with"}{" "}
          <strong>{chatWith}</strong>
        </p>
      )}

      <div className="bg-white p-4 rounded shadow h-96 overflow-y-auto">
        {messages.map((msg, idx) => {
          const entities = parseEntities(msg.entities);

          return (
            <div
              key={idx}
              className={`mb-3 ${
                msg.sender === user.role ? "text-right" : "text-left"
              }`}
            >
              <div
                className={`inline-block p-3 rounded-lg max-w-md text-white ${
                  msg.sender === "agent" ? "bg-blue-900" : "bg-gray-700"
                }`}
              >
                <p
                  className="whitespace-pre-wrap break-words"
                  dangerouslySetInnerHTML={{
                    __html: highlightEntities(msg.text, entities),
                  }}
                />

                {msg.emotion && (
                  <div className="text-xs mt-2 flex justify-end">
                    <span className="px-2 py-0.5 rounded-full bg-black/30">
                      {emotionMap[msg.emotion]?.emoji}{" "}
                      {emotionMap[msg.emotion]?.label}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* -------- INPUT -------- */}
      <div className="mt-4 flex">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
          className="flex-1 p-2 border rounded-l"
          placeholder="Type your message..."
          disabled={sessionEnded}
        />

        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 rounded-r"
          disabled={sessionEnded}
        >
          Send
        </button>
      </div>

      {user.role === "customer" && !sessionEnded && (
        <button
          onClick={handleEndChat}
          className="mt-4 bg-red-600 text-white px-4 py-1 rounded"
        >
          End Chat
        </button>
      )}
    </div>
  );
};

export default ChatComponent;
