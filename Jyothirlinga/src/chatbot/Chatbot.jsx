import React, { useState, useEffect, useRef } from "react";
import "./Chatbot.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Function to automatically scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // This effect runs whenever the messages array changes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // This effect runs only once when the component first loads
  useEffect(() => {
    setMessages([
      {
        text: "Namaste! I am your guide to the 12 Jyotirlingas of Lord Shiva. How can I help you today?",
        isUser: false,
      },
    ]);
  }, []);

  const handleSend = async () => {
    if (input.trim() === "" || isLoading) return;

    const userMessage = { text: input, isUser: true };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      // Point to your backend server!
      const response = await fetch(
        "https://one2-jyothirlinga.onrender.com/api/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: currentInput }), // Send the message in the request body
        }
      );

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const result = await response.json();

      // Safely access the response text
      if (
        result.candidates &&
        result.candidates[0] &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts[0]
      ) {
        const botResponseText = result.candidates[0].content.parts[0].text;
        const botMessage = { text: botResponseText, isUser: false };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } else {
        throw new Error("Invalid response structure from API");
      }
    } catch (error) {
      console.error("Error fetching from backend:", error);
      const errorMessage = {
        text: "Sorry, I couldn't connect to the server or the API response was malformed. Please check the console.",
        isUser: false,
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <header className="chatbot-header">
        <h1>Jyotirlinga Chatbot</h1>
      </header>

      {/* API Key input is now REMOVED */}

      <div className="messages-container">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message-wrapper ${message.isUser ? "user" : "bot"}`}
          >
            <div className="message-bubble">{message.text}</div>
          </div>
        ))}
        {isLoading && (
          <div className="message-wrapper bot">
            <div className="message-bubble">Typing...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          className="message-input"
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          className="send-button"
          disabled={isLoading}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
