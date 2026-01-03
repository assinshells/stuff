import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { useApp } from "../../app/AppContext";

/**
 * ForgotPasswordPage - запрос на сброс пароля (только email)
 */

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const { showNotification, showError } = useApp();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      showError("Please enter your email");
      return;
    }

    if (!email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
      showError("Please enter a valid email");
      return;
    }

    setLoading(true);

    try {
      await forgotPassword(email);
      setSuccess(true);
      showNotification(
        "Password reset instructions sent! Check your email (or console in DEV mode)",
        "success"
      );
    } catch (error) {
      showError(error.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

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
                  <h2 className="fw-bold mb-3">Check Your Email</h2>
                  <p className="text-muted mb-4">
                    We've sent password reset instructions to your email
                    address.
                  </p>
                  <div className="alert alert-info mb-4">
                    <i className="bi bi-info-circle me-2"></i>
                    <small>
                      <strong>DEV MODE:</strong> Check server logs (Pino) for
                      the reset email content
                    </small>
                  </div>
                  <button
                    className="btn btn-primary w-100 mb-2"
                    onClick={() => navigate("/login")}
                  >
                    Back to Login
                  </button>
                  <button
                    className="btn btn-link w-100 text-decoration-none"
                    onClick={() => setSuccess(false)}
                  >
                    Didn't receive the email? Try again
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
                    <i className="bi bi-key display-3 text-primary"></i>
                  </div>
                  <h2 className="fw-bold">Forgot Password?</h2>
                  <p className="text-muted">
                    Enter your email address and we'll send you reset
                    instructions.
                  </p>
                </div>

                {/* Warning */}
                <div className="alert alert-warning mb-4">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <small>
                    <strong>Note:</strong> You must have provided an email
                    during registration to reset your password.
                  </small>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label">Email Address</label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoFocus
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 mb-3"
                    disabled={loading || !email.trim()}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Sending...
                      </>
                    ) : (
                      "Send Reset Instructions"
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

            {/* Security Notice */}
            <div className="text-center mt-4">
              <p className="text-muted">
                <small>
                  <i className="bi bi-shield-check me-1"></i>
                  For security reasons, we'll send instructions even if the
                  email doesn't exist
                </small>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
