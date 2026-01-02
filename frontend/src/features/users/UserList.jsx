import { useState, useEffect, useCallback } from "react";
import { useApp } from "../../app/AppContext";
import { userApi } from "../../shared/api/userApi";
import { LoadingSpinner, ErrorAlert, EmptyState } from "../../shared/ui";

/**
 * Компонент списка пользователей
 */

// Debounce helper
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const UserList = () => {
  const { showError, showNotification, withLoading } = useApp();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Фильтры
  const [filters, setFilters] = useState({
    role: "",
    isActive: "",
  });

  // Debounced фильтры
  const debouncedFilters = useDebounce(filters, 300);

  /**
   * Загрузка пользователей
   */
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...debouncedFilters,
      };

      const response = await userApi.getAll(params);

      setUsers(response.data.users);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages,
      }));
    } catch (err) {
      setError(err.message);
      showError(err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedFilters, showError]);

  /**
   * Удаление пользователя
   */
  const handleDelete = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await withLoading(async () => {
        await userApi.delete(userId);
        showNotification("User deleted successfully", "success");
        await loadUsers();
      });
    } catch (err) {
      // Ошибка уже обработана в withLoading
    }
  };

  /**
   * Изменение страницы
   */
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  /**
   * Изменение фильтров
   */
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Загрузка при изменении page или debouncedFilters
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  if (loading && users.length === 0) {
    return <LoadingSpinner />;
  }

  if (error && users.length === 0) {
    return (
      <div className="container mt-5">
        <ErrorAlert message={error} onRetry={loadUsers} />
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1">
            <i className="bi bi-people-fill me-2"></i>
            Users
          </h1>
          <p className="text-muted mb-0">
            Manage your users ({pagination.total} total)
          </p>
        </div>
        <button className="btn btn-primary">
          <i className="bi bi-plus-lg me-2"></i>
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={filters.role}
                onChange={(e) => handleFilterChange("role", e.target.value)}
              >
                <option value="">All roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={filters.isActive}
                onChange={(e) => handleFilterChange("isActive", e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setFilters({ role: "", isActive: "" });
                }}
              >
                <i className="bi bi-x-circle me-2"></i>
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading overlay для фильтров */}
      {loading && users.length > 0 && (
        <div className="text-center mb-3">
          <div
            className="spinner-border spinner-border-sm text-primary"
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-2 text-muted">Updating...</span>
        </div>
      )}

      {/* Users Table */}
      {users.length === 0 ? (
        <EmptyState
          icon="bi-people"
          title="No users found"
          message="Try adjusting your filters or add a new user"
          action={{
            label: "Add User",
            onClick: () => console.log("Add user"),
          }}
        />
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Age</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar-circle bg-primary text-white me-2">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <strong>{user.name}</strong>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.age || "—"}</td>
                    <td>
                      <span
                        className={`badge ${
                          user.role === "admin" ? "bg-danger" : "bg-secondary"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          user.isActive ? "bg-success" : "bg-warning"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          title="Edit"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(user.id)}
                          title="Delete"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="card-footer">
              <nav>
                <ul className="pagination mb-0 justify-content-center">
                  <li
                    className={`page-item ${
                      pagination.page === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </button>
                  </li>
                  {[...Array(pagination.pages)].map((_, i) => (
                    <li
                      key={i + 1}
                      className={`page-item ${
                        pagination.page === i + 1 ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${
                      pagination.page === pagination.pages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      )}

      <style>{`
        .avatar-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default UserList;
