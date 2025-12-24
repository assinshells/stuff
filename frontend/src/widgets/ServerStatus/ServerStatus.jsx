import { useState, useEffect } from "react";
import { healthApi } from "../../shared/api/healthApi";
import "./ServerStatus.css";

export const ServerStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkServerHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await healthApi.checkHealth();
      setStatus(response);
    } catch (err) {
      setError(err.message);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkServerHealth();

    // Check health every 30 seconds
    const interval = setInterval(checkServerHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading && !status) {
    return (
      <div className="server-status checking">
        <div className="status-indicator"></div>
        <span>Checking server...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="server-status error">
        <div className="status-indicator"></div>
        <div>
          <strong>Server Unavailable</strong>
          <p>{error}</p>
        </div>
        <button onClick={checkServerHealth} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="server-status healthy">
      <div className="status-indicator"></div>
      <div>
        <strong>Server Online</strong>
        <p>Environment: {status?.environment}</p>
        <p>Database: {status?.database?.status}</p>
      </div>
    </div>
  );
};

export default ServerStatus;
