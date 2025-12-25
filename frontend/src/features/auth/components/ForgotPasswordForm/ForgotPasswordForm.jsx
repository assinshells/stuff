import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../../../shared/api/authApi";
import { ErrorMessage } from "../../../../shared/ui/ErrorMessage/ErrorMessage";
import { Captcha } from "../../../../shared/ui/Captcha/Captcha";
import "./ForgotPasswordForm.css";

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
      const response = await authApi.requestPasswordReset({
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
      <div className="forgot-password-success">
        <div className="success-icon">✓</div>
        <h2>Check Your Email</h2>
        <p>
          If an account exists with the provided information, you will receive a
          password reset link shortly.
        </p>
        <button
          type="button"
          className="submit-button"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <form className="forgot-password-form" onSubmit={handleSubmit}>
      <h2>Reset Password</h2>
      <p className="form-description">
        Enter your username or email address and we'll send you a link to reset
        your password.
      </p>

      {generalError && <ErrorMessage message={generalError} />}

      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className={errors.username ? "error" : ""}
          placeholder="Your username"
          autoComplete="username"
        />
        {errors.username && (
          <div className="field-error">{errors.username}</div>
        )}
      </div>

      <div className="form-divider">
        <span>OR</span>
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? "error" : ""}
          placeholder="your@email.com"
          autoComplete="email"
        />
        {errors.email && <div className="field-error">{errors.email}</div>}
      </div>

      <div className="form-group">
        <Captcha onChange={handleCaptchaChange} error={errors.captchaToken} />
      </div>

      <button type="submit" className="submit-button" disabled={loading}>
        {loading ? "Sending..." : "Send Reset Link"}
      </button>

      <div className="form-footer">
        <button
          type="button"
          className="link-button"
          onClick={() => navigate("/login")}
        >
          ← Back to Login
        </button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
