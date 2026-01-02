import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useApp } from "../../app/AppContext";

/**
 * ResetPasswordPage - установка нового пароля
 * URL: /reset-password?token=xxx
 */

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();
  const { showNotification, showError } = useApp();

  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Показать/скрыть пароль
  const [showPassword, setShowPassword] = useState(false);

  // Извлекаем токен из URL
  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      showError("Invalid reset link");
      navigate("/login");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams, navigate, showError]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Валидация
    if (!newPassword || newPassword.length < 8) {
      showError("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      showError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
      showNotification("Password reset successful!", "success");
    } catch (error) {
      showError(error.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // Проверка силы пароля
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    const levels = [
      { strength: 0, label: "", color: "" },
      { strength: 1, label: "Weak", color: "danger" },
      { strength: 2, label: "Fair", color: "warning" },
      { strength: 3, label: "Good", color: "info" },
      { strength: 4, label: "Strong", color: "success" },
      { strength: 5, label: "Very Strong", color: "success" },
    ];

    return levels[Math.min(strength, 5)];
  };

  const passwordStrength = getPasswordStrength(newPassword);

  if (success) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="card shadow-lg border-0">
                <div className="card-body p-5 text-center">
                  <div className="mb-4">
                    <i className="bi bi-check-circle display-1 text-success"></i>
                  </div>
                  <h2 className="fw-bold mb-3">Password Reset!</h2>
                  <p className="text-muted mb-4">
                    Your password has been reset successfully. You can now login
                    with your new password.
                  </p>
                  <button
                    className="btn btn-primary btn-lg w-100"
                    onClick={() => navigate("/login")}
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <i className="bi bi-shield-lock display-3 text-primary"></i>
                  </div>
                  <h2 className="fw-bold">Reset Password</h2>
                  <p className="text-muted">Enter your new password below</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">
                      New Password <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        placeholder="At least 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoFocus
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i
                          className={`bi bi-eye${showPassword ? "-slash" : ""}`}
                        ></i>
                      </button>
                    </div>

                    {/* Password Strength */}
                    {newPassword && (
                      <div className="mt-2">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small className="text-muted">
                            Password strength:
                          </small>
                          <small className={`text-${passwordStrength.color}`}>
                            {passwordStrength.label}
                          </small>
                        </div>
                        <div className="progress" style={{ height: "4px" }}>
                          <div
                            className={`progress-bar bg-${passwordStrength.color}`}
                            style={{
                              width: `${
                                (passwordStrength.strength / 5) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="form-label">
                      Confirm Password <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-lock-fill"></i>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control ${
                          confirmPassword &&
                          (newPassword === confirmPassword
                            ? "is-valid"
                            : "is-invalid")
                        }`}
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <div className="invalid-feedback d-block">
                        Passwords do not match
                      </div>
                    )}
                  </div>

                  {/* Password Requirements */}
                  <div className="alert alert-light mb-4">
                    <small className="text-muted">
                      <strong>Password requirements:</strong>
                      <ul className="mb-0 mt-2 ps-3">
                        <li
                          className={
                            newPassword.length >= 8 ? "text-success" : ""
                          }
                        >
                          At least 8 characters
                        </li>
                        <li
                          className={
                            /[A-Z]/.test(newPassword) ? "text-success" : ""
                          }
                        >
                          One uppercase letter (recommended)
                        </li>
                        <li
                          className={
                            /\d/.test(newPassword) ? "text-success" : ""
                          }
                        >
                          One number (recommended)
                        </li>
                      </ul>
                    </small>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 mb-3"
                    disabled={
                      loading ||
                      !newPassword ||
                      !confirmPassword ||
                      newPassword !== confirmPassword ||
                      newPassword.length < 8
                    }
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Resetting...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn btn-link w-100 text-decoration-none"
                    onClick={() => navigate("/login")}
                    disabled={loading}
                  >
                    <i className="bi bi-arrow-left me-1"></i>
                    Back to Login
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
