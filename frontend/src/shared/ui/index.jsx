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
        <div className="d-flex gap-2">
          {onRetry && (
            <button className="btn btn-sm btn-outline-danger" onClick={onRetry}>
              <i className="bi bi-arrow-clockwise me-1"></i>
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
 * Отображается в правом верхнем углу
 */
export const NotificationToast = ({ notification, onDismiss }) => {
  if (!notification) return null;

  const config = {
    success: {
      bg: "bg-success",
      icon: "bi-check-circle-fill",
    },
    error: {
      bg: "bg-danger",
      icon: "bi-exclamation-triangle-fill",
    },
    warning: {
      bg: "bg-warning",
      icon: "bi-exclamation-circle-fill",
    },
    info: {
      bg: "bg-info",
      icon: "bi-info-circle-fill",
    },
  };

  const { bg, icon } = config[notification.type] || config.info;

  return (
    <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
      <div
        className={`toast show ${bg} text-white`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="toast-header">
          <i className={`bi ${icon} me-2`}></i>
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
 * Отображается когда нет данных
 */
export const EmptyState = ({
  icon = "bi-inbox",
  title = "No data",
  message = "Nothing to display",
  action,
}) => {
  return (
    <div className="text-center py-5">
      <i className={`bi ${icon} display-1 text-muted mb-3`}></i>
      <h4 className="mb-2">{title}</h4>
      <p className="text-muted mb-4">{message}</p>
      {action && (
        <button className="btn btn-primary" onClick={action.onClick}>
          <i className={`bi ${action.icon || "bi-plus-lg"} me-2`}></i>
          {action.label}
        </button>
      )}
    </div>
  );
};

/**
 * Confirmation Modal
 * Для подтверждения действий
 */
export const ConfirmModal = ({
  show,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // primary, danger, warning
}) => {
  if (!show) return null;

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onCancel}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <p>{message}</p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className={`btn btn-${variant}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
