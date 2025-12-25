import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@features/auth/context/AuthContext";
import { PasswordField } from "@shared/ui/PasswordField/PasswordField";
import { ErrorMessage } from "@shared/ui/ErrorMessage/ErrorMessage";
import { Captcha } from "@shared/ui/Captcha/Captcha";

export const RegisterForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: location.state?.username || "",
    email: "",
    password: "",
    confirmPassword: "",
    captchaToken: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [showFromLoginMessage, setShowFromLoginMessage] = useState(false);

  useEffect(() => {
    if (location.state?.fromLogin) {
      setShowFromLoginMessage(true);
      setTimeout(() => setShowFromLoginMessage(false), 5000);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleCaptchaChange = (token) => {
    setFormData((prev) => ({
      ...prev,
      captchaToken: token,
    }));
    if (errors.captchaToken) {
      setErrors((prev) => ({
        ...prev,
        captchaToken: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.username)) {
      newErrors.username = "Username must contain only letters and numbers";
    }

    if (
      formData.email &&
      !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)
    ) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.captchaToken) {
      newErrors.captchaToken = "Please complete the captcha";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      await register({
        username: formData.username,
        email: formData.email || undefined,
        password: formData.password,
        captchaToken: formData.captchaToken,
      });
      // Auto-login after successful registration
      navigate("/dashboard");
    } catch (error) {
      if (error.data?.errors) {
        const fieldErrors = {};
        error.data.errors.forEach((err) => {
          fieldErrors[err.field] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        setGeneralError(
          error.message || "Registration failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto"
      style={{ maxWidth: "400px" }}
    >
      <h2 className="text-center mb-4">Create Account</h2>

      {showFromLoginMessage && (
        <div className="alert alert-info" role="alert">
          <i className="bi bi-info-circle me-2"></i>
          User not found. Please register to create a new account.
        </div>
      )}

      {generalError && <ErrorMessage message={generalError} />}

      <div className="mb-3">
        <label htmlFor="username" className="form-label">
          Username <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          className={`form-control ${errors.username ? "is-invalid" : ""}`}
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Choose a username"
          autoComplete="username"
        />
        {errors.username && (
          <div className="invalid-feedback d-block">{errors.username}</div>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="email" className="form-label">
          Email <span className="text-muted">(optional)</span>
        </label>
        <input
          type="email"
          className={`form-control ${errors.email ? "is-invalid" : ""}`}
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your@email.com"
          autoComplete="email"
        />
        {errors.email && (
          <div className="invalid-feedback d-block">{errors.email}</div>
        )}
        <div className="form-text">
          Email is optional but recommended for password recovery
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="password" className="form-label">
          Password <span className="text-danger">*</span>
        </label>
        <PasswordField
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="Create a password"
          autoComplete="new-password"
        />
      </div>

      <div className="mb-3">
        <label htmlFor="confirmPassword" className="form-label">
          Confirm Password <span className="text-danger">*</span>
        </label>
        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          placeholder="Confirm your password"
          autoComplete="new-password"
        />
      </div>

      <div className="mb-3">
        <Captcha onChange={handleCaptchaChange} error={errors.captchaToken} />
      </div>

      <button
        type="submit"
        className="btn btn-primary w-100 mb-3"
        disabled={loading}
      >
        {loading ? (
          <>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            Creating Account...
          </>
        ) : (
          "Create Account"
        )}
      </button>

      <div className="text-center">
        <span className="text-muted">Already have an account? </span>
        <Link to="/login" className="text-decoration-none">
          Login
        </Link>
      </div>
    </form>
  );
};

export default RegisterForm;
