export const ErrorMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div
      className="alert alert-danger d-flex align-items-center mb-3"
      role="alert"
    >
      <i className="bi bi-exclamation-circle-fill me-2"></i>
      <div>{message}</div>
    </div>
  );
};

export default ErrorMessage;
