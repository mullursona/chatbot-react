import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";
import Login from "./pages/Login";

function App() {
    const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const [chatHistory, setChatHistory] = useState(() => {
    const savedHistory = localStorage.getItem("chatHistory");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

useEffect(() => {
  fetch("http://localhost:5000/api/chat-history")
    .then((res) => res.json())
    .then((data) => {
      setChatHistory(data);
    })
    .catch((error) => {
      console.error("Error loading chat history:", error);
    });
}, []);


  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem("chatMessages");

    return savedMessages
      ? JSON.parse(savedMessages)
      : [
          {
            text: "Hello! 👋 How can I help you today?",
            sender: "bot",
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ];
  });
  const [chatId, setChatId] = useState(() => crypto.randomUUID());

useEffect(() => {
  fetch(`http://localhost:5000/api/messages?chatId=${chatId}`)
    

  
    .then((res) => res.json())
    .then((data) => {
      setMessages(
  data.length > 0
    ? data
    : [
        {
          text: "Hello! 👋 How can I help you today?",
          sender: "bot",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]
);
    })
    .catch((error) => {
      console.error("Error loading messages:", error);
    });
}, [])



  const [isTyping, setIsTyping] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    return JSON.parse(localStorage.getItem("darkMode")) || false;
  });

  const chatBodyRef = useRef(null);

  // SEND MESSAGE
 const sendMessage = async () => {
    if (message.trim() === "") return;

    const userMessage = {
  chatId: chatId,
  text: message,
  sender: "user",
  time: new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }),
};

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);

    setMessage("");
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
         body: JSON.stringify({
  chatId: chatId,
  messages: [...messages, userMessage],
}),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

     const botMessage = {
  chatId: chatId,
  text: data.reply,
  sender: "bot",
  time: new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }),
};
      

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error:", error);

      const botMessage = {
        text: "⚠️ Sorry, something went wrong. Please try again.",
        sender: "bot",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    }

    setIsTyping(false);
  };

  // AUTO SCROLL
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop =
        chatBodyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // SAVE MESSAGES
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  // SAVE CHAT HISTORY
  useEffect(() => {
    localStorage.setItem(
      "chatHistory",
      JSON.stringify(chatHistory)
    );
  }, [chatHistory]);

  // SAVE DARK MODE
  useEffect(() => {
    localStorage.setItem(
      "darkMode",
      JSON.stringify(darkMode)
    );
  }, [darkMode]);

   // NEW CHAT
const newChat = () => {
  const newId = crypto.randomUUID();

  setChatHistory((prevHistory) => {
    if (messages.length > 1) {
      const updatedHistory = [
        ...prevHistory,
        { messages: messages },
      ];

      localStorage.setItem(
        "chatHistory",
        JSON.stringify(updatedHistory)
      );

      return updatedHistory;
    }

    return prevHistory;
  });

  setChatId(newId);

  setMessages([
    {
      chatId: newId,
      sender: "bot",
      text: "Hello! 👋 How can I help you today?",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  setSearch("");
};

 // CLEAR CURRENT CHAT
const clearChat = async () => {
  const welcomeMessage = {
    text: "Hello! 👋 How can I help you today?",
    sender: "bot",
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  try {
    await fetch(`http://localhost:5000/api/messages/${chatId}`, {
      method: "DELETE",
    });

    setMessages([welcomeMessage]);

    setChatHistory((prevHistory) =>
      prevHistory.filter((chat) => chat._id !== chatId)
    );
  } catch (error) {
    console.error("Error clearing chat:", error);
  }
};

  const deleteChat = async (indexToDelete) => {
  const chatToDelete = chatHistory[indexToDelete];

  
  if (!chatToDelete) return;
 const chatIdToDelete = chatToDelete._id;

  try {
    const response = await fetch(
      `http://localhost:5000/api/messages/${chatIdToDelete}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete chat");
    }

    setChatHistory((prevHistory) =>
      prevHistory.filter(
        (_, index) => index !== indexToDelete
      )
    );
  } catch (error) {
    console.error("Delete chat error:", error);
  }
};

  // CLEAR ALL HISTORY
const clearHistory = async () => {
  if (
    window.confirm(
      "Are you sure you want to delete all chat history?"
    )
  ) {
    try {
      for (const chat of chatHistory) {
        if (chat._id) {
          await fetch(
            `http://localhost:5000/api/messages/${chat._id}`,
            {
              method: "DELETE",
            }
          );
        }
      }

      setChatHistory([]);
      localStorage.removeItem("chatHistory");
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  }
};

  // DELETE MESSAGE
  const deleteMessage = (indexToDelete) => {
    setMessages((prevMessages) =>
      prevMessages.filter(
        (_, index) => index !== indexToDelete
      )
    );
  };

  // COPY MESSAGE
  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
    alert("Message copied!");
  };

    if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="app">
      <div className={`chat-container ${darkMode ? "dark" : ""}`}>

        {/* HEADER */}
        <div className="chat-header">
          <strong>🤖 ChatBot</strong>

          <button
  onClick={() => {
    localStorage.removeItem("user");
    setUser(null);
  }}
>
  🚪 Logout
</button>

          <button className="clear-btn" onClick={clearChat}>
  Clear
</button>

          <button onClick={newChat}>
            🆕 New Chat
          </button>

<button
  className="dark-mode-btn"
  onClick={() => setDarkMode(!darkMode)}
>
  {darkMode ? "☀️" : "🌙"}
</button>
        </div>

        {/* CHAT HISTORY */}
        <div className="chat-history">
          <h3>📚 Chat History</h3>

          <button
            className="clear-history-btn"
            onClick={clearHistory}
          >
            🗑️ Clear History
          </button>

          <div className="chat-history-list">
            {chatHistory.length === 0 ? (
              <div className="no-messages">
                No previous chats
              </div>
            ) : (
             chatHistory.map((chat, index) => (
  <div
    className="chat-history-item"
    key={index}
  >
    <button
      onClick={() => setMessages(chat.messages || [])}
    >
      {chat.messages?.find(
        (msg) => msg.sender === "user"
      )?.text?.slice(0, 30) || `Chat ${index + 1}`}
    </button>

    <button
      onClick={() => deleteChat(index)}
    >
      ❌
    </button>
  </div>
))
            )}
          </div>
        </div>

        {/* SEARCH */}
        <div className="search-container">
          <input
            id="searchInput"
            type="text"
            placeholder="🔍 Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* CHAT BODY */}
        <div
          className="chat-body"
          ref={chatBodyRef}
        >
          {messages
            .filter((msg) =>
              msg.text
                .toLowerCase()
                .includes(search.toLowerCase())
            )
            .map((msg, index) => (
              <div
                key={index}
                className={
                  msg.sender === "bot"
                    ? "bot-message"
                    : "user-message"
                }
              ><ReactMarkdown
  components={{
                code({ inline, children, ...props }) {
                 const codeText = String(children).replace(/\n$/, "");

                if (inline) {
                  return <code {...props}>{children}</code>;
                }

                      return (
                        <div className="code-container">
                          <button
                            className="copy-code-btn"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                codeText
                              );

                              setCopiedCode(codeText);

                              setTimeout(() => {
                                setCopiedCode("");
                              }, 2000);
                            }}
                          >
                            {copiedCode === codeText
                              ? "✅ Copied!"
                              : "📋 Copy Code"}
                          </button>

                          <code
                            className="code-block"
                            {...props}
                          >
                            {children}
                          </code>
                        </div>
                      );
                    },
                  }}
                >
                  {msg.text}
                </ReactMarkdown>

                <small>{msg.time}</small>

                <div className="message-actions">
                  <button
                    className="copy-btn"
                    onClick={() => copyMessage(msg.text)}
                  >
                    📋
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => deleteMessage(index)}
                  >
                    ❌
                  </button>
                </div>
              </div>
            ))}

          {isTyping && (
            <div className="bot-message">
              Bot is typing...
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="chat-footer">
          <input
            id="messageInput"
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />

          <button
            onClick={sendMessage}
            disabled={isTyping}
          >
            {isTyping ? "Thinking..." : "Send"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default App;