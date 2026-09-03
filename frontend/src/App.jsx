import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setMessage("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const result = await axios.post(
        "https://ask-pilot.onrender.com/api/chat",
        {
          message: userMessage,
        }
      );

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.data.response },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "You are out of tokens. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="container">
      <div className="chat-header">
        <h1>Ask Pilot</h1>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <p>Start a conversation with the AI Agent</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <div className="message-content">
                {msg.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="message assistant">
            <div className="message-content loading">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
      </div>

      <div className="input-area">
        <textarea
          type="text"
          placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          rows={3}
        />
        <button onClick={sendMessage} disabled={loading || !message.trim()}>
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default App;