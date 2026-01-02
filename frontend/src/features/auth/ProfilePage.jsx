import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../app/AppContext";

/**
 * ProfilePage - профиль пользователя
 */

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useApp();

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await logout();
      showNotification("Logged out successfully", "info");
      navigate("/login");
    }
  };

  if (!user) return null;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5">
              {/* Header */}
              <div className="text-center mb-4">
                <div
                  className="avatar-circle bg-primary text-white mx-auto mb-3"
                  style={{ width: "80px", height: "80px", fontSize: "32px" }}
                >
                  {user.nickname.charAt(0).toUpperCase()}
                </div>
                <h2 className="fw-bold mb-1">{user.nickname}</h2>
                {user.email && (
                  <p className="text-muted mb-0">
                    <i className="bi bi-envelope me-2"></i>
                    {user.email}
                  </p>
                )}
              </div>

              {/* Info Cards */}
              <div className="row g-3 mb-4">
                <div className="col-6">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <i className="bi bi-shield-check fs-3 text-primary mb-2"></i>
                      <h6 className="mb-0">Role</h6>
                      <span
                        className={`badge bg-${
                          user.role === "admin" ? "danger" : "secondary"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <i className="bi bi-calendar fs-3 text-primary mb-2"></i>
                      <h6 className="mb-0">Member Since</h6>
                      <small className="text-muted">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="card bg-light mb-4">
                <div className="card-body">
                  <h6 className="mb-3">
                    <i className="bi bi-person-badge me-2"></i>
                    Account Details
                  </h6>
                  <table className="table table-sm mb-0">
                    <tbody>
                      <tr>
                        <td className="text-muted">User ID</td>
                        <td className="text-end">
                          <code className="small">{user.id}</code>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted">Status</td>
                        <td className="text-end">
                          <span
                            className={`badge bg-${
                              user.isActive ? "success" : "warning"
                            }`}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                      {user.email && (
                        <tr>
                          <td className="text-muted">Email Verified</td>
                          <td className="text-end">
                            <span
                              className={`badge bg-${
                                user.isEmailVerified ? "success" : "warning"
                              }`}
                            >
                              {user.isEmailVerified ? "Yes" : "No"}
                            </span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="d-grid gap-2">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => navigate("/")}
                >
                  <i className="bi bi-house me-2"></i>
                  Back to Home
                </button>
                <button
                  className="btn btn-outline-danger"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </button>
              </div>
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

export default ProfilePage;
