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
          setMessages(await getMessages(session.session_id));
        }

        if (user?.role === "agent" && sessionIdProp) {
          setSessionId(sessionIdProp);
          setChatWith(chatWithProp);
          setMessages(await getMessages(sessionIdProp));
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
      setMessages(await getMessages(sessionId));
    }, 3000);

    return () => clearInterval(interval);
  }, [sessionId]);

  /* -------- SEND MESSAGE -------- */
  const handleSend = async () => {
    if (!input.trim()) return;

    await sendMessage({
      session_id: sessionId,
      sender_id: user.id,
      sender: user.role,
      text: input.trim(),
    });

    setMessages(await getMessages(sessionId));
    setInput("");
  };

  /* -------- END CHAT -------- */
  const handleEndChat = async () => {
    await apiEndSession(sessionId, user.id);
    setSessionEnded(true);
    onEnd && onEnd();
  };

  /* -------- ALL KB ANSWERS -------- */
  const kbMessages = messages.filter(
    (m) =>
      m.sender === "customer" &&
      m.kb_answer &&
      typeof m.kb_answer === "object" &&
      m.kb_answer.answer,
  );

  return (
    <div className="mt-4 flex flex-col gap-4">
      {/* CHAT HEADER */}
      {chatWith && (
        <p className="text-sm text-gray-400">
          {user.role === "customer" ? "👨‍💼 Chatting with" : "👤 Chatting with"}{" "}
          <strong className="text-gray-200">{chatWith}</strong>
        </p>
      )}

      {/* CHAT WINDOW */}
      <div className="bg-zinc-900 p-4 rounded shadow h-80 overflow-y-auto scroll-dark">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-3 ${
              msg.sender === user.role ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block p-3 rounded-lg max-w-md text-white ${
                msg.sender === "agent" ? "bg-blue-900" : "bg-zinc-700"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>

              {msg.emotion && (
                <div className="text-xs mt-2 flex justify-end opacity-80">
                  {emotionMap[msg.emotion]?.emoji}{" "}
                  {emotionMap[msg.emotion]?.label}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="flex">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 p-2 bg-zinc-800 border border-zinc-700 text-white rounded-l"
          placeholder="Type your message..."
          disabled={sessionEnded}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r"
        >
          Send
        </button>
      </div>

      {/* =================================================
          🤖 AI KNOWLEDGE INSIGHTS — DARK MODE
      ================================================= */}
      {user.role === "agent" && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 max-h-72 overflow-y-auto scroll-dark">
          <h3 className="text-gray-200 font-semibold mb-4 flex items-center gap-2">
            🧠 AI Knowledge Insights
            <span className="text-xs text-gray-400">(live)</span>
          </h3>

          {kbMessages.length === 0 ? (
            <p className="text-sm text-gray-400">
              No AI insights generated yet.
            </p>
          ) : (
            <div className="space-y-4">
              {kbMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-zinc-800 border-l-4 border-blue-500 rounded-md p-4 shadow"
                >
                  {/* Customer Quote */}
                  <p className="text-xs text-gray-400 mb-1">
                    Based on customer message
                  </p>
                  <blockquote className="italic text-sm text-gray-300 border-l border-zinc-600 pl-3 mb-3">
                    “{msg.text}”
                  </blockquote>

                  {/* AI Guidance */}
                  <p className="text-xs font-semibold text-blue-400 mb-1">
                    AI Suggested Guidance
                  </p>
                  <div className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {msg.kb_answer.answer}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* END CHAT */}
      {user.role === "customer" && !sessionEnded && (
        <button
          onClick={handleEndChat}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded w-fit"
        >
          End Chat
        </button>
      )}
    </div>
  );
};

export default ChatComponent;
