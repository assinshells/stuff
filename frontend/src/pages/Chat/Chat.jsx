import { useAuth } from "../../features/auth/context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Chat.css";

export const Chat = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        <div className="welcome-card">
          <h2>Welcome, {user?.username}!</h2>
          <p>You are successfully logged in.</p>

          <div className="user-info">
            <h3>Your Account Details</h3>
            <div className="info-row">
              <span className="info-label">Username:</span>
              <span className="info-value">{user?.username}</span>
            </div>
            {user?.email && (
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{user?.email}</span>
              </div>
            )}
            <div className="info-row">
              <span className="info-label">Account Created:</span>
              <span className="info-value">
                {new Date(user?.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Authentication</h3>
            <p>JWT-based authentication with refresh tokens</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔑</div>
            <h3>Password Reset</h3>
            <p>Email-based password recovery system</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Protected Routes</h3>
            <p>Secure access to authenticated areas</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Fast & Reliable</h3>
            <p>Production-ready MERN stack</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
