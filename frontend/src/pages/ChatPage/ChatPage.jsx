import { useState } from "react";
import { useAuth } from "../../features/auth/AuthContext";

/**
 * ChatPage - главная страница с чатом
 *
 * Структура:
 * - Левый sidebar: список чатов/контактов
 * - Центральная часть: сообщения
 * - Правый sidebar: информация о чате
 * - Форма отправки сообщений внизу
 */

// Левый сайдбар - список чатов
const LeftSidebar = ({ selectedChat, onSelectChat, chats }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="d-flex flex-column h-100 border-end bg-light"
      style={{ width: "320px" }}
    >
      {/* Header */}
      <div className="p-3 border-bottom bg-white">
        <h5 className="mb-3">
          <i className="bi bi-chat-dots me-2"></i>
          Chats
        </h5>

        {/* Search */}
        <div className="input-group">
          <span className="input-group-text bg-white">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-grow-1 overflow-auto">
        {filteredChats.length === 0 ? (
          <div className="text-center p-4 text-muted">
            <i className="bi bi-inbox display-4 d-block mb-2"></i>
            <small>No chats found</small>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={`p-3 border-bottom cursor-pointer ${
                selectedChat?.id === chat.id ? "bg-primary bg-opacity-10" : ""
              }`}
              onClick={() => onSelectChat(chat)}
              style={{ cursor: "pointer" }}
            >
              <div className="d-flex align-items-start">
                {/* Avatar */}
                <div
                  className="avatar-circle bg-primary text-white me-2 flex-shrink-0"
                  style={{ width: "48px", height: "48px", fontSize: "18px" }}
                >
                  {chat.name.charAt(0).toUpperCase()}
                </div>

                {/* Chat Info */}
                <div className="flex-grow-1 min-w-0">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <h6 className="mb-0 text-truncate">{chat.name}</h6>
                    {chat.unreadCount > 0 && (
                      <span className="badge bg-primary rounded-pill ms-2">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-muted small mb-0 text-truncate">
                    {chat.lastMessage}
                  </p>
                  <small className="text-muted">{chat.lastMessageTime}</small>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-3 border-top bg-white">
        <button className="btn btn-primary w-100">
          <i className="bi bi-plus-lg me-2"></i>
          New Chat
        </button>
      </div>

      <style>{`
        .avatar-circle {
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
        .cursor-pointer:hover {
          background-color: rgba(var(--bs-primary-rgb), 0.05);
        }
      `}</style>
    </div>
  );
};

// Правый сайдбар - информация о чате
const RightSidebar = ({ selectedChat, onClose }) => {
  if (!selectedChat) {
    return (
      <div
        className="d-flex flex-column h-100 border-start bg-light"
        style={{ width: "300px" }}
      >
        <div className="p-4 text-center text-muted">
          <i className="bi bi-info-circle display-4 mb-2"></i>
          <p>Select a chat to see details</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="d-flex flex-column h-100 border-start bg-light"
      style={{ width: "300px" }}
    >
      {/* Header */}
      <div className="p-3 border-bottom bg-white d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Chat Info</h6>
        <button className="btn btn-sm btn-link" onClick={onClose}>
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      {/* Chat Avatar */}
      <div className="p-4 text-center border-bottom">
        <div
          className="avatar-circle bg-primary text-white mx-auto mb-3"
          style={{ width: "80px", height: "80px", fontSize: "32px" }}
        >
          {selectedChat.name.charAt(0).toUpperCase()}
        </div>
        <h5 className="mb-1">{selectedChat.name}</h5>
        <small className="text-muted">{selectedChat.type}</small>
      </div>

      {/* Chat Details */}
      <div className="flex-grow-1 overflow-auto p-3">
        <div className="mb-4">
          <h6 className="text-muted mb-2">
            <i className="bi bi-people me-2"></i>
            Members
          </h6>
          <div className="card">
            <div className="list-group list-group-flush">
              {selectedChat.members?.map((member, index) => (
                <div key={index} className="list-group-item">
                  <div className="d-flex align-items-center">
                    <div
                      className="avatar-circle bg-secondary text-white me-2"
                      style={{
                        width: "32px",
                        height: "32px",
                        fontSize: "14px",
                      }}
                    >
                      {member.charAt(0).toUpperCase()}
                    </div>
                    <span>{member}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h6 className="text-muted mb-2">
            <i className="bi bi-gear me-2"></i>
            Settings
          </h6>
          <div className="card">
            <div className="list-group list-group-flush">
              <button className="list-group-item list-group-item-action">
                <i className="bi bi-bell me-2"></i>
                Notifications
              </button>
              <button className="list-group-item list-group-item-action">
                <i className="bi bi-image me-2"></i>
                Media
              </button>
              <button className="list-group-item list-group-item-action text-danger">
                <i className="bi bi-trash me-2"></i>
                Clear Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .avatar-circle {
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

// Область сообщений
const MessagesArea = ({ selectedChat, messages }) => {
  const { user } = useAuth();

  if (!selectedChat) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
        <i className="bi bi-chat-text display-1 mb-3"></i>
        <h5>Select a chat to start messaging</h5>
        <p>Choose a conversation from the left panel</p>
      </div>
    );
  }

  return (
    <div
      className="flex-grow-1 overflow-auto p-4"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      {messages.length === 0 ? (
        <div className="text-center text-muted py-5">
          <i className="bi bi-chat-dots display-4 mb-2"></i>
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {messages.map((message, index) => {
            const isOwn = message.sender === user.nickname;
            const showAvatar =
              index === 0 || messages[index - 1].sender !== message.sender;

            return (
              <div
                key={message.id}
                className={`d-flex ${
                  isOwn ? "justify-content-end" : "justify-content-start"
                }`}
              >
                {!isOwn && showAvatar && (
                  <div
                    className="avatar-circle bg-secondary text-white me-2 flex-shrink-0"
                    style={{ width: "36px", height: "36px", fontSize: "14px" }}
                  >
                    {message.sender.charAt(0).toUpperCase()}
                  </div>
                )}

                {!isOwn && !showAvatar && (
                  <div
                    style={{ width: "44px" }}
                    className="flex-shrink-0"
                  ></div>
                )}

                <div style={{ maxWidth: "70%" }}>
                  {!isOwn && showAvatar && (
                    <small className="text-muted ms-1">{message.sender}</small>
                  )}

                  <div
                    className={`p-3 rounded-3 ${
                      isOwn ? "bg-primary text-white" : "bg-white border"
                    }`}
                  >
                    <p className="mb-1">{message.text}</p>
                    <small className={isOwn ? "text-white-50" : "text-muted"}>
                      {message.time}
                    </small>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .avatar-circle {
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

// Форма отправки сообщений
const MessageForm = ({ selectedChat, onSendMessage }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && selectedChat) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-3 border-top bg-white">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <button
            type="button"
            className="btn btn-outline-secondary"
            title="Attach file"
            disabled={!selectedChat}
          >
            <i className="bi bi-paperclip"></i>
          </button>

          <textarea
            className="form-control"
            placeholder={
              selectedChat
                ? "Type a message..."
                : "Select a chat to send messages"
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!selectedChat}
            rows="1"
            style={{ resize: "none", minHeight: "42px" }}
          />

          <button
            type="button"
            className="btn btn-outline-secondary"
            title="Add emoji"
            disabled={!selectedChat}
          >
            <i className="bi bi-emoji-smile"></i>
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!selectedChat || !message.trim()}
          >
            <i className="bi bi-send-fill"></i>
          </button>
        </div>
      </form>
    </div>
  );
};

// Главный компонент ChatPage
const ChatPage = () => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [showRightSidebar, setShowRightSidebar] = useState(false);

  // Mock данные (в будущем будут из API)
  const [chats] = useState([
    {
      id: 1,
      name: "General",
      type: "Group",
      lastMessage: "Hey everyone!",
      lastMessageTime: "2m ago",
      unreadCount: 3,
      members: ["alice", "bob", "charlie", user.nickname],
    },
    {
      id: 2,
      name: "Development Team",
      type: "Group",
      lastMessage: "Check the new PR",
      lastMessageTime: "15m ago",
      unreadCount: 0,
      members: ["dev1", "dev2", user.nickname],
    },
    {
      id: 3,
      name: "john_doe",
      type: "Private",
      lastMessage: "See you tomorrow",
      lastMessageTime: "1h ago",
      unreadCount: 1,
      members: ["john_doe", user.nickname],
    },
  ]);

  const [messages] = useState([
    {
      id: 1,
      sender: "alice",
      text: "Hey everyone! How's the project going?",
      time: "10:30 AM",
    },
    {
      id: 2,
      sender: user.nickname,
      text: "Going well! Just finished the authentication module.",
      time: "10:32 AM",
    },
    {
      id: 3,
      sender: "bob",
      text: "Nice work! Can you share the code?",
      time: "10:35 AM",
    },
    {
      id: 4,
      sender: user.nickname,
      text: "Sure, I'll push it to GitHub in a few minutes.",
      time: "10:36 AM",
    },
  ]);

  const handleSendMessage = (message) => {
    console.log("Sending message:", message);
    // TODO: Implement message sending logic
  };

  const handleToggleRightSidebar = () => {
    setShowRightSidebar(!showRightSidebar);
  };

  return (
    <div className="d-flex vh-100" style={{ marginTop: "56px" }}>
      {/* Left Sidebar */}
      <LeftSidebar
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
        chats={chats}
      />

      {/* Main Chat Area */}
      <div className="d-flex flex-column flex-grow-1">
        {/* Chat Header */}
        {selectedChat && (
          <div className="p-3 border-bottom bg-white d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <div
                className="avatar-circle bg-primary text-white me-2"
                style={{ width: "40px", height: "40px", fontSize: "16px" }}
              >
                {selectedChat.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h6 className="mb-0">{selectedChat.name}</h6>
                <small className="text-muted">
                  {selectedChat.members?.length} members
                </small>
              </div>
            </div>

            <div>
              <button className="btn btn-sm btn-outline-secondary me-2">
                <i className="bi bi-telephone"></i>
              </button>
              <button className="btn btn-sm btn-outline-secondary me-2">
                <i className="bi bi-camera-video"></i>
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={handleToggleRightSidebar}
              >
                <i className="bi bi-info-circle"></i>
              </button>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <MessagesArea selectedChat={selectedChat} messages={messages} />

        {/* Message Form */}
        <MessageForm
          selectedChat={selectedChat}
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* Right Sidebar */}
      {showRightSidebar && (
        <RightSidebar
          selectedChat={selectedChat}
          onClose={() => setShowRightSidebar(false)}
        />
      )}

      <style>{`
        .avatar-circle {
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default ChatPage;
