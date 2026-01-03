import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./AppContext";
import { AuthProvider, useAuth } from "../features/auth/AuthContext";
import { LoadingSpinner, NotificationToast } from "../shared/ui";
import LoginPage from "../features/auth/LoginPage";
import ForgotPasswordPage from "../features/auth/ForgotPasswordPage";
import ResetPasswordPage from "../features/auth/ResetPasswordPage";
import ProfilePage from "../features/auth/ProfilePage";
import ProtectedRoute, { AdminRoute } from "../features/auth/ProtectedRoute";
import UserList from "../features/users/UserList";
import ChatPage from "../features/chat/ChatPage";

/**
 * Layout компонент для защищенных страниц
 */
const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { showNotification } = useApp();

  const handleLogout = async () => {
    await logout();
    showNotification("Logged out successfully", "info");
  };

  return (
    <>
      {/* Navbar */}
      <nav
        className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top"
        style={{ zIndex: 1030 }}
      >
        <div className="container-fluid px-4">
          <a className="navbar-brand" href="/">
            <i className="bi bi-chat-dots-fill me-2"></i>
            {import.meta.env.VITE_APP_NAME || "Chat App"}
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <a className="nav-link" href="/">
                  <i className="bi bi-chat-text me-1"></i>
                  Chats
                </a>
              </li>
              {user?.role === "admin" && (
                <li className="nav-item">
                  <a className="nav-link" href="/users">
                    <i className="bi bi-people me-1"></i>
                    Users
                  </a>
                </li>
              )}
            </ul>
            <ul className="navbar-nav">
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  <div className="d-inline-flex align-items-center">
                    <div
                      className="avatar-circle bg-white text-primary me-2"
                      style={{
                        width: "32px",
                        height: "32px",
                        fontSize: "14px",
                      }}
                    >
                      {user?.nickname.charAt(0).toUpperCase()}
                    </div>
                    {user?.nickname}
                  </div>
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <a className="dropdown-item" href="/profile">
                      <i className="bi bi-person me-2"></i>
                      Profile
                    </a>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>

      <style>{`
        .avatar-circle {
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
      `}</style>
    </>
  );
};

/**
 * App Content с роутингом
 */
const AppContent = () => {
  const { isLoading, notification, showNotification } = useApp();

  return (
    <>
      {/* Глобальный Loading */}
      {isLoading && <LoadingSpinner fullScreen />}

      {/* Уведомления */}
      {notification && (
        <NotificationToast
          notification={notification}
          onDismiss={() => showNotification(null)}
        />
      )}

      {/* Routes */}
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ChatPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin only routes */}
        <Route
          path="/users"
          element={
            <AdminRoute>
              <AppLayout>
                <UserList />
              </AppLayout>
            </AdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

/**
 * Main App
 */
const App = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
