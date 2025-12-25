import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { authApi } from "@shared/api/authApi";
import { PasswordField } from "@shared/ui/PasswordField/PasswordField";
import { ErrorMessage } from "@shared/ui/ErrorMessage/ErrorMessage";

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
      <div className="text-center mx-auto" style={{ maxWidth: "400px" }}>
        <div className="mb-4">
          <i
            className="bi bi-x-circle-fill text-danger"
            style={{ fontSize: "5rem" }}
          ></i>
        </div>
        <h2 className="mb-3">Invalid Link</h2>
        <p className="text-muted mb-4">
          This password reset link is invalid or has expired.
        </p>
        <button
          type="button"
          className="btn btn-primary w-100"
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
      <div className="text-center mx-auto" style={{ maxWidth: "400px" }}>
        <div className="mb-4">
          <i
            className="bi bi-check-circle-fill text-success"
            style={{ fontSize: "5rem" }}
          ></i>
        </div>
        <h2 className="mb-3">Password Reset Successful</h2>
        <p className="text-muted mb-4">
          Your password has been successfully reset.
        </p>
        <button
          type="button"
          className="btn btn-primary w-100"
          onClick={() => navigate("/login")}
        >
          Login with New Password
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
      <h2 className="text-center mb-3">Set New Password</h2>
      <p className="text-center text-muted mb-4">
        Please enter your new password below.
      </p>

      {generalError && <ErrorMessage message={generalError} />}

      <div className="mb-3">
        <label htmlFor="newPassword" className="form-label">
          New Password <span className="text-danger">*</span>
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
          placeholder="Confirm new password"
          autoComplete="new-password"
        />
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
            Resetting...
          </>
        ) : (
          "Reset Password"
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

export default ResetPasswordForm;
