import { useAuth } from "@features/auth/context/AuthContext";
import { useNavigate } from "react-router-dom";

export const Chat = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <nav
        className="navbar navbar-dark"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div className="container-fluid px-4">
          <h1 className="navbar-brand mb-0 h1">Dashboard</h1>
          <button onClick={handleLogout} className="btn btn-outline-light">
            <i className="bi bi-box-arrow-right me-2"></i>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container py-5">
        {/* Welcome Card */}
        <div className="card shadow-sm mb-4">
          <div className="card-body p-4">
            <h2 className="card-title mb-3">Welcome, {user?.username}!</h2>
            <p className="text-muted mb-4">You are successfully logged in.</p>

            {/* User Info */}
            <div className="bg-light rounded p-4">
              <h3 className="h5 mb-3">Your Account Details</h3>

              <div className="row g-3">
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <span className="fw-medium text-muted">Username:</span>
                    <span>{user?.username}</span>
                  </div>
                </div>

                {user?.email && (
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                      <span className="fw-medium text-muted">Email:</span>
                      <span>{user?.email}</span>
                    </div>
                  </div>
                )}

                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center py-2">
                    <span className="fw-medium text-muted">
                      Account Created:
                    </span>
                    <span>
                      {new Date(user?.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="row g-4">
          <div className="col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm text-center hover-lift">
              <div className="card-body p-4">
                <div className="mb-3" style={{ fontSize: "3rem" }}>
                  <i className="bi bi-shield-lock"></i>
                </div>
                <h3 className="h5 card-title">Secure Authentication</h3>
                <p className="card-text text-muted small">
                  JWT-based authentication with refresh tokens
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm text-center hover-lift">
              <div className="card-body p-4">
                <div className="mb-3" style={{ fontSize: "3rem" }}>
                  <i className="bi bi-key"></i>
                </div>
                <h3 className="h5 card-title">Password Reset</h3>
                <p className="card-text text-muted small">
                  Email-based password recovery system
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm text-center hover-lift">
              <div className="card-body p-4">
                <div className="mb-3" style={{ fontSize: "3rem" }}>
                  <i className="bi bi-shield-check"></i>
                </div>
                <h3 className="h5 card-title">Protected Routes</h3>
                <p className="card-text text-muted small">
                  Secure access to authenticated areas
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm text-center hover-lift">
              <div className="card-body p-4">
                <div className="mb-3" style={{ fontSize: "3rem" }}>
                  <i className="bi bi-lightning"></i>
                </div>
                <h3 className="h5 card-title">Fast & Reliable</h3>
                <p className="card-text text-muted small">
                  Production-ready MERN stack
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hover-lift {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </div>
  );
};

export default Chat;
