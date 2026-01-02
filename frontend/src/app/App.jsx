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
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <a className="navbar-brand" href="/">
            <i className="bi bi-layers me-2"></i>
            {import.meta.env.VITE_APP_NAME || "Fullstack App"}
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
                  <i className="bi bi-house me-1"></i>
                  Home
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
      <main className="min-vh-100 bg-light">{children}</main>

      {/* Footer */}
      <footer className="bg-dark text-white py-4 mt-5">
        <div className="container text-center">
          <p className="mb-0">
            &copy; {new Date().getFullYear()} Fullstack App.
            <span className="ms-2">
              v{import.meta.env.VITE_APP_VERSION || "1.0.0"}
            </span>
          </p>
        </div>
      </footer>

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
 * Home Page
 */
const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold mb-3">
              Welcome, {user?.nickname}! 👋
            </h1>
            <p className="lead text-muted">
              You're successfully logged in to the fullstack application.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-6">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center p-4">
                  <i className="bi bi-person-circle display-1 text-primary mb-3"></i>
                  <h5 className="card-title">Your Profile</h5>
                  <p className="card-text text-muted">
                    View and manage your account information
                  </p>
                  <a href="/profile" className="btn btn-primary">
                    Go to Profile
                  </a>
                </div>
              </div>
            </div>

            {user?.role === "admin" && (
              <div className="col-md-6">
                <div className="card h-100 shadow-sm">
                  <div className="card-body text-center p-4">
                    <i className="bi bi-people-fill display-1 text-danger mb-3"></i>
                    <h5 className="card-title">Manage Users</h5>
                    <p className="card-text text-muted">
                      Admin panel for user management
                    </p>
                    <a href="/users" className="btn btn-danger">
                      Manage Users
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card mt-4 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">
                <i className="bi bi-shield-check me-2"></i>
                Security Features
              </h5>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  JWT Authentication with refresh tokens
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Bcrypt password hashing
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Rate limiting on authentication endpoints
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  HttpOnly cookies for secure token storage
                </li>
                <li className="mb-0">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Role-based access control (RBAC)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
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
                <HomePage />
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
