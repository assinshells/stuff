import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { AppProvider, useApp } from "./AppContext";
import { LoadingSpinner, NotificationToast } from "../shared/ui";
import UserList from "../features/users/UserList";

/**
 * Главный компонент приложения
 *
 * Структура:
 * - AppProvider для глобального состояния
 * - Глобальный loading
 * - Уведомления
 * - Роутинг (можно добавить React Router)
 */

/**
 * Внутренний компонент приложения
 * Здесь уже доступен useApp hook
 */
const AppContent = () => {
  const { isLoading, notification, showNotification } = useApp();

  return (
    <>
      {/* Глобальный Loading */}
      {isLoading && <LoadingSpinner fullScreen />}

      {/* Уведомления */}
      {notification && (
        <NotificationToast
          notification={notification}
          onDismiss={() => showNotification(null)}
        />
      )}

      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <a className="navbar-brand" href="/">
            <i className="bi bi-layers me-2"></i>
            {import.meta.env.VITE_APP_NAME || "Fullstack App"}
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link active" href="/">
                  Users
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/about">
                  About
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-vh-100 bg-light">
        <UserList />
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white py-4 mt-5">
        <div className="container text-center">
          <p className="mb-0">
            &copy; {new Date().getFullYear()} Fullstack App.
            <span className="ms-2">
              v{import.meta.env.VITE_APP_VERSION || "1.0.0"}
            </span>
          </p>
        </div>
      </footer>
    </>
  );
};

/**
 * Главный компонент с провайдером
 */
const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
