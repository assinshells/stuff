import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@features/auth/context/AuthContext";
import { authApi } from "@shared/api/authApi";
import { PasswordField } from "@shared/ui/PasswordField/PasswordField";
import { ErrorMessage } from "@shared/ui/ErrorMessage/ErrorMessage";

export const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

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

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
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
      await login(formData);
      navigate("/dashboard");
    } catch (error) {
      if (error.status === 401) {
        try {
          const checkResponse = await authApi.checkUser(formData.username);
          if (!checkResponse.data.exists) {
            navigate("/register", {
              state: {
                username: formData.username,
                fromLogin: true,
              },
            });
          } else {
            setGeneralError("Invalid username or password");
          }
        } catch (checkError) {
          setGeneralError("Invalid username or password");
        }
      } else {
        setGeneralError(error.message || "Login failed. Please try again.");
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
      <h2 className="text-center mb-4">Login</h2>

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
          placeholder="Enter your username"
          autoComplete="username"
        />
        {errors.username && (
          <div className="invalid-feedback d-block">{errors.username}</div>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <PasswordField
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="Enter your password"
          autoComplete="current-password"
        />
      </div>

      <div className="d-flex justify-content-end mb-3">
        <Link to="/forgot-password" className="text-decoration-none">
          Forgot password?
        </Link>
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
            Logging in...
          </>
        ) : (
          "Login"
        )}
      </button>

      <div className="text-center">
        <span className="text-muted">Don't have an account? </span>
        <Link to="/register" className="text-decoration-none">
          Register
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;
