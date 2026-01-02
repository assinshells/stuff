/**
 * Переиспользуемые UI компоненты
 */

/**
 * Loading Spinner
 */
export const LoadingSpinner = ({ fullScreen = false, size = "normal" }) => {
  const spinnerClass = size === "small" ? "spinner-border-sm" : "";

  if (fullScreen) {
    return (
      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
        style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999 }}
      >
        <div
          className={`spinner-border text-light ${spinnerClass}`}
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-5">
      <div
        className={`spinner-border text-primary ${spinnerClass}`}
        role="status"
      >
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

/**
 * Error Alert
 */
export const ErrorAlert = ({ message, onRetry, onDismiss }) => {
  return (
    <div
      className="alert alert-danger alert-dismissible fade show"
      role="alert"
    >
      <div className="d-flex align-items-center">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        <div className="flex-grow-1">
          <strong>Error:</strong> {message}
        </div>
        <div>
          {onRetry && (
            <button
              className="btn btn-sm btn-outline-danger me-2"
              onClick={onRetry}
            >
              Retry
            </button>
          )}
          {onDismiss && (
            <button
              type="button"
              className="btn-close"
              onClick={onDismiss}
              aria-label="Close"
            ></button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Success Alert
 */
export const SuccessAlert = ({ message, onDismiss }) => {
  return (
    <div
      className="alert alert-success alert-dismissible fade show"
      role="alert"
    >
      <div className="d-flex align-items-center">
        <i className="bi bi-check-circle-fill me-2"></i>
        <div className="flex-grow-1">{message}</div>
        {onDismiss && (
          <button
            type="button"
            className="btn-close"
            onClick={onDismiss}
            aria-label="Close"
          ></button>
        )}
      </div>
    </div>
  );
};

/**
 * Notification Toast
 */
export const NotificationToast = ({ notification, onDismiss }) => {
  if (!notification) return null;

  const bgClass =
    {
      success: "bg-success",
      error: "bg-danger",
      warning: "bg-warning",
      info: "bg-info",
    }[notification.type] || "bg-info";

  const iconClass =
    {
      success: "bi-check-circle-fill",
      error: "bi-exclamation-triangle-fill",
      warning: "bi-exclamation-circle-fill",
      info: "bi-info-circle-fill",
    }[notification.type] || "bi-info-circle-fill";

  return (
    <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
      <div className={`toast show ${bgClass} text-white`} role="alert">
        <div className="toast-header">
          <i className={`bi ${iconClass} me-2`}></i>
          <strong className="me-auto text-capitalize">
            {notification.type}
          </strong>
          <button
            type="button"
            className="btn-close"
            onClick={onDismiss}
            aria-label="Close"
          ></button>
        </div>
        <div className="toast-body">{notification.message}</div>
      </div>
    </div>
  );
};

/**
 * Empty State
 */
export const EmptyState = ({
  icon = "bi-inbox",
  title = "No data",
  message = "Nothing to display",
  action,
}) => {
  return (
    <div className="text-center py-5">
      <i className={`bi ${icon} display-1 text-muted`}></i>
      <h4 className="mt-3">{title}</h4>
      <p className="text-muted">{message}</p>
      {action && (
        <button className="btn btn-primary mt-3" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
};
