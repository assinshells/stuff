import "./AuthLayout.css";

export const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout min-vh-100 d-flex align-items-center justify-content-center">
      <div className="auth-container">
        <div className="auth-header text-white text-center p-4">
          <h1 className="mb-2">Fullstack App</h1>
          <p className="mb-0">Secure Authentication System</p>
        </div>
        <div className="auth-content p-4">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
