import "./AuthLayout.css";

export const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Fullstack App</h1>
          <p>Secure Authentication System</p>
        </div>
        <div className="auth-content">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
