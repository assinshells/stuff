import { useState } from "react";

export const PasswordField = ({
  id,
  name,
  value,
  onChange,
  placeholder = "Password",
  error,
  required = false,
  autoComplete = "current-password",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="position-relative">
      <input
        type={showPassword ? "text" : "password"}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`form-control pe-5 ${error ? "is-invalid" : ""}`}
        required={required}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted"
        onClick={toggleShowPassword}
        aria-label={showPassword ? "Hide password" : "Show password"}
        style={{ textDecoration: "none", padding: "0.375rem 0.75rem" }}
      >
        {showPassword ? (
          <i className="bi bi-eye-slash"></i>
        ) : (
          <i className="bi bi-eye"></i>
        )}
      </button>
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
};

export default PasswordField;
