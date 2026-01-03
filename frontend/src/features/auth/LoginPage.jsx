import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useApp } from "../../app/AppContext";

/**
 * LoginPage - вход/регистрация только по nickname
 *
 * Flow:
 * 1. Пользователь вводит nickname
 * 2. Проверяем существование
 * 3a. Существует → форма входа (пароль)
 * 3b. Не существует → форма регистрации (пароль + email)
 */

const LoginPage = () => {
  const navigate = useNavigate();
  const { checkUser, login, register } = useAuth();
  const { showNotification, showError } = useApp();

  // UI State
  const [step, setStep] = useState("check"); // check | login | register
  const [loading, setLoading] = useState(false);

  // Form Data
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState("dev-captcha-token");

  /**
   * Шаг 1: Проверка пользователя
   */
  const handleCheckUser = async (e) => {
    e.preventDefault();

    if (!nickname.trim()) {
      showError("Please enter your nickname");
      return;
    }

    setLoading(true);

    try {
      const result = await checkUser(nickname);

      if (result.exists) {
        // Пользователь найден → переход к login
        setStep("login");
      } else {
        // Пользователь не найден → переход к register
        setStep("register");
      }
    } catch (error) {
      showError(error.message || "Failed to check user");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Шаг 2a: Вход
   */
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!password) {
      showError("Please enter your password");
      return;
    }

    setLoading(true);

    try {
      await login(nickname, password);
      showNotification("Welcome back!", "success");
      navigate("/");
    } catch (error) {
      showError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Шаг 2b: Регистрация
   */
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!password || password.length < 8) {
      showError("Password must be at least 8 characters");
      return;
    }

    if (email && !email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
      showError("Please enter a valid email");
      return;
    }

    setLoading(true);

    try {
      await register(nickname, password, email, captchaToken);
      showNotification("Account created successfully!", "success");
      navigate("/");
    } catch (error) {
      showError(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Вернуться назад
   */
  const handleBack = () => {
    setStep("check");
    setPassword("");
    setEmail("");
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                {/* Logo/Header */}
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <i className="bi bi-chat-dots-fill display-3 text-primary"></i>
                  </div>
                  <h2 className="fw-bold">
                    {step === "check" && "Welcome"}
                    {step === "login" && "Welcome Back"}
                    {step === "register" && "Create Account"}
                  </h2>
                  <p className="text-muted">
                    {step === "check" && "Enter your nickname to continue"}
                    {step === "login" && `Hi, ${nickname}`}
                    {step === "register" && "Complete your registration"}
                  </p>
                </div>

                {/* Step 1: Check User */}
                {step === "check" && (
                  <form onSubmit={handleCheckUser}>
                    <div className="mb-4">
                      <label className="form-label">Nickname</label>
                      <div className="input-group input-group-lg">
                        <span className="input-group-text">
                          <i className="bi bi-person"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="your_nickname"
                          value={nickname}
                          onChange={(e) =>
                            setNickname(e.target.value.toLowerCase())
                          }
                          autoFocus
                          disabled={loading}
                        />
                      </div>
                      <small className="form-text text-muted">
                        Lowercase letters, numbers, and underscores only
                      </small>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-lg w-100 mb-3"
                      disabled={loading || !nickname.trim()}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Checking...
                        </>
                      ) : (
                        "Continue"
                      )}
                    </button>
                  </form>
                )}

                {/* Step 2a: Login */}
                {step === "login" && (
                  <form onSubmit={handleLogin}>
                    <div className="mb-3">
                      <div className="d-flex align-items-center p-3 bg-light rounded">
                        <i className="bi bi-person-circle fs-4 me-2 text-primary"></i>
                        <div>
                          <small className="text-muted d-block">
                            Logging in as
                          </small>
                          <strong>{nickname}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label">Password</label>
                      <div className="input-group input-group-lg">
                        <span className="input-group-text">
                          <i className="bi bi-lock"></i>
                        </span>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoFocus
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-lg w-100 mb-3"
                      disabled={loading || !password}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Logging in...
                        </>
                      ) : (
                        "Login"
                      )}
                    </button>

                    <div className="d-flex justify-content-between">
                      <button
                        type="button"
                        className="btn btn-link text-decoration-none"
                        onClick={handleBack}
                        disabled={loading}
                      >
                        <i className="bi bi-arrow-left me-1"></i>
                        Back
                      </button>
                      <button
                        type="button"
                        className="btn btn-link text-decoration-none"
                        onClick={() => navigate("/forgot-password")}
                        disabled={loading}
                      >
                        Forgot password?
                      </button>
                    </div>
                  </form>
                )}

                {/* Step 2b: Register */}
                {step === "register" && (
                  <form onSubmit={handleRegister}>
                    <div className="alert alert-info mb-4">
                      <i className="bi bi-info-circle me-2"></i>
                      Nickname <strong>{nickname}</strong> is available. Let's
                      create an account!
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Nickname <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={nickname}
                        disabled
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Password <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoFocus
                        disabled={loading}
                      />
                      <small className="form-text text-muted">
                        Minimum 8 characters
                      </small>
                    </div>

                    <div className="mb-4">
                      <label className="form-label">
                        Email{" "}
                        <span className="text-muted">
                          (optional, for password recovery)
                        </span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                      />
                      <small className="form-text text-muted">
                        Required only if you want to recover your password
                      </small>
                    </div>

                    {/* Dev Captcha Notice */}
                    <div className="alert alert-warning mb-4">
                      <i className="bi bi-robot me-2"></i>
                      <small>
                        <strong>DEV MODE:</strong> Captcha validation is
                        disabled
                      </small>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-success btn-lg w-100 mb-3"
                      disabled={loading || !password || password.length < 8}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </button>

                    <button
                      type="button"
                      className="btn btn-link w-100 text-decoration-none"
                      onClick={handleBack}
                      disabled={loading}
                    >
                      <i className="bi bi-arrow-left me-1"></i>
                      Back
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Footer Links */}
            <div className="text-center mt-4">
              <p className="text-muted">
                <small>
                  By continuing, you agree to our{" "}
                  <a href="/terms" className="text-decoration-none">
                    Terms of Service
                  </a>
                </small>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
