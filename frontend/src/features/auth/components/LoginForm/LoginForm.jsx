import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../../../shared/api/authApi";
import { PasswordField } from "../../../../shared/ui/PasswordField/PasswordField";
import { ErrorMessage } from "../../../../shared/ui/ErrorMessage/ErrorMessage";
import "./LoginForm.css";

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
    // Clear error for this field
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
        // User not found, check if user exists
        try {
          const checkResponse = await authApi.checkUser(formData.username);
          if (!checkResponse.data.exists) {
            // User doesn't exist, redirect to registration with pre-filled data
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
    <form className="login-form" onSubmit={handleSubmit}>
      <h2>Login</h2>

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
          placeholder="Enter your username"
          autoComplete="username"
        />
        {errors.username && (
          <div className="field-error">{errors.username}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
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

      <div className="form-actions">
        <button
          type="button"
          className="link-button"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot password?
        </button>
      </div>

      <button type="submit" className="submit-button" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>

      <div className="form-footer">
        <span>Don't have an account? </span>
        <button
          type="button"
          className="link-button"
          onClick={() => navigate("/register")}
        >
          Register
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
