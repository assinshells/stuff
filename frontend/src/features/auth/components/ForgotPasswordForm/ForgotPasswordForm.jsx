import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "@shared/api/authApi";
import { ErrorMessage } from "@shared/ui/ErrorMessage/ErrorMessage";
import { Captcha } from "@shared/ui/Captcha/Captcha";

export const ForgotPasswordForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    captchaToken: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [success, setSuccess] = useState(false);

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

    if (!formData.username.trim() && !formData.email.trim()) {
      newErrors.general = "Please provide either username or email";
    }

    if (
      formData.email &&
      !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)
    ) {
      newErrors.email = "Invalid email format";
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

    if (!validateForm()) {
      if (errors.general) {
        setGeneralError(errors.general);
      }
      return;
    }

    setLoading(true);

    try {
      await authApi.requestPasswordReset({
        username: formData.username || undefined,
        email: formData.email || undefined,
        captchaToken: formData.captchaToken,
      });

      setSuccess(true);
    } catch (error) {
      if (error.data?.errors) {
        const fieldErrors = {};
        error.data.errors.forEach((err) => {
          fieldErrors[err.field] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        setGeneralError(
          error.message || "Failed to send reset link. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center mx-auto" style={{ maxWidth: "400px" }}>
        <div className="mb-4">
          <i
            className="bi bi-check-circle-fill text-success"
            style={{ fontSize: "5rem" }}
          ></i>
        </div>
        <h2 className="mb-3">Check Your Email</h2>
        <p className="text-muted mb-4">
          If an account exists with the provided information, you will receive a
          password reset link shortly.
        </p>
        <button
          type="button"
          className="btn btn-primary w-100"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto"
      style={{ maxWidth: "400px" }}
    >
      <h2 className="text-center mb-3">Reset Password</h2>
      <p className="text-center text-muted mb-4">
        Enter your username or email address and we'll send you a link to reset
        your password.
      </p>

      {generalError && <ErrorMessage message={generalError} />}

      <div className="mb-3">
        <label htmlFor="username" className="form-label">
          Username
        </label>
        <input
          type="text"
          className={`form-control ${errors.username ? "is-invalid" : ""}`}
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Your username"
          autoComplete="username"
        />
        {errors.username && (
          <div className="invalid-feedback d-block">{errors.username}</div>
        )}
      </div>

      <div className="text-center my-3">
        <span className="text-muted">OR</span>
      </div>

      <div className="mb-3">
        <label htmlFor="email" className="form-label">
          Email
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
            Sending...
          </>
        ) : (
          "Send Reset Link"
        )}
      </button>

      <div className="text-center">
        <Link to="/login" className="text-decoration-none">
          <i className="bi bi-arrow-left me-1"></i>
          Back to Login
        </Link>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
