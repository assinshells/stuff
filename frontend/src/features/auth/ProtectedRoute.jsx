import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { LoadingSpinner } from "../../shared/ui";

/**
 * ProtectedRoute - защищенный роут
 * Требует авторизации для доступа
 */

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, isAuthenticated } = useAuth();

  // Пока загружается - показываем спиннер
  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  // Не авторизован - редирект на логин
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Проверка роли (если требуется)
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card shadow-lg border-0">
                <div className="card-body p-5 text-center">
                  <i className="bi bi-shield-x display-1 text-danger mb-4"></i>
                  <h2 className="fw-bold mb-3">Access Denied</h2>
                  <p className="text-muted mb-4">
                    You don't have permission to access this page.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => window.history.back()}
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

/**
 * Admin-only route
 */
export const AdminRoute = ({ children }) => {
  return <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>;
};

export default ProtectedRoute;
