import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../../../../shared/api/authApi";
import { PasswordField } from "../../../../shared/ui/PasswordField/PasswordField";
import { ErrorMessage } from "../../../../shared/ui/ErrorMessage/ErrorMessage";
import "./ResetPasswordForm.css";

export const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="reset-password-error">
        <h2>Invalid Link</h2>
        <p>This password reset link is invalid or has expired.</p>
        <button
          type="button"
          className="submit-button"
          onClick={() => navigate("/forgot-password")}
        >
          Request New Link
        </button>
      </div>
    );
  }

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = "Password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      await authApi.resetPassword({
        token,
        newPassword: formData.newPassword,
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
          error.message ||
            "Failed to reset password. The link may have expired."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="reset-password-success">
        <div className="success-icon">✓</div>
        <h2>Password Reset Successful</h2>
        <p>Your password has been successfully reset.</p>
        <button
          type="button"
          className="submit-button"
          onClick={() => navigate("/login")}
        >
          Login with New Password
        </button>
      </div>
    );
  }

  return (
    <form className="reset-password-form" onSubmit={handleSubmit}>
      <h2>Set New Password</h2>
      <p className="form-description">Please enter your new password below.</p>

      {generalError && <ErrorMessage message={generalError} />}

      <div className="form-group">
        <label htmlFor="newPassword">
          New Password <span className="required">*</span>
        </label>
        <PasswordField
          id="newPassword"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          error={errors.newPassword}
          placeholder="Enter new password"
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
          placeholder="Confirm new password"
          autoComplete="new-password"
        />
      </div>

      <button type="submit" className="submit-button" disabled={loading}>
        {loading ? "Resetting..." : "Reset Password"}
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

export default ResetPasswordForm;
