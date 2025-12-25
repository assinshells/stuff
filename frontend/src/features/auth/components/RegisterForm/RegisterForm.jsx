import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { PasswordField } from "../../../../shared/ui/PasswordField/PasswordField";
import { ErrorMessage } from "../../../../shared/ui/ErrorMessage/ErrorMessage";
import { Captcha } from "../../../../shared/ui/Captcha/Captcha";
import "./RegisterForm.css";

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
    <form className="register-form" onSubmit={handleSubmit}>
      <h2>Create Account</h2>

      {showFromLoginMessage && (
        <div className="info-message">
          User not found. Please register to create a new account.
        </div>
      )}

      {generalError && <ErrorMessage message={generalError} />}

      <div className="form-group">
        <label htmlFor="username">
          Username <span className="required">*</span>
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className={errors.username ? "error" : ""}
          placeholder="Choose a username"
          autoComplete="username"
        />
        {errors.username && (
          <div className="field-error">{errors.username}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="email">
          Email <span className="optional">(optional)</span>
        </label>
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
        <div className="field-hint">
          Email is optional but recommended for password recovery
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="password">
          Password <span className="required">*</span>
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

      <div className="form-group">
        <label htmlFor="confirmPassword">
          Confirm Password <span className="required">*</span>
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

      <div className="form-group">
        <Captcha onChange={handleCaptchaChange} error={errors.captchaToken} />
      </div>

      <button type="submit" className="submit-button" disabled={loading}>
        {loading ? "Creating Account..." : "Create Account"}
      </button>

      <div className="form-footer">
        <span>Already have an account? </span>
        <button
          type="button"
          className="link-button"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;
