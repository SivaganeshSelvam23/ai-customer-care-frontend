// ChatComponent.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import {
  startSession,
  getMessages,
  sendMessage,
  endSession as apiEndSession,
} from "../services/sessionService";

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
  }, [user, sessionIdProp]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (sessionId) {
        try {
          const updatedMessages = await getMessages(sessionId);
          setMessages(updatedMessages);

          if (updatedMessages.length === 0 && user.role === "agent") {
            setSessionEnded(true);
            setTimeout(() => {
              if (onEnd) onEnd();
            }, 3000);
          }
        } catch (err) {
          console.error("Error polling messages:", err);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [sessionId]);

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
      console.error("Message send failed:", err.response?.data || err.message);
    }
  };

  const handleEndChat = async () => {
    try {
      await apiEndSession(sessionId, user.id);
      alert("Chat session ended.");
      if (onEnd) onEnd();
    } catch (err) {
      console.error("Failed to end session:", err);
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

      {sessionEnded && user.role === "agent" && (
        <div className="mb-4 text-yellow-600 bg-yellow-100 border border-yellow-300 px-4 py-2 rounded">
          ⚠️ This session has ended.
        </div>
      )}

      <div className="bg-white p-4 rounded shadow h-96 overflow-y-scroll">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 ${msg.sender === user.role ? "text-right" : "text-left"
              }`}
          >
            <div className="inline-block bg-blue-900 text-white p-3 rounded-lg max-w-md">
              <p>{msg.text}</p>

              {msg.emotion !== null && (
                <div className="text-sm mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white">
                    {emotionMap[msg.emotion]?.emoji || "❓"}
                    <span className="capitalize">
                      {emotionMap[msg.emotion]?.label || "unknown"}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();     
              handleSend();
            }
          }}
          className="flex-1 p-2  border rounded-l"
          placeholder="Type your message..."
          disabled={sessionEnded}
        />

        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 ml-3 rounded-r"
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
