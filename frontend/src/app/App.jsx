import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@features/auth/context/AuthContext";
import { ProtectedRoute } from "@features/auth/components/ProtectedRoute/ProtectedRoute";
import { AuthLayout } from "@features/auth/components/AuthLayout/AuthLayout";
import { LoginForm } from "@features/auth/components/LoginForm/LoginForm";
import { RegisterForm } from "@features/auth/components/RegisterForm/RegisterForm";
import { ForgotPasswordForm } from "@features/auth/components/ForgotPasswordForm/ForgotPasswordForm";
import { ResetPasswordForm } from "@features/auth/components/ResetPasswordForm/ResetPasswordForm";
import { Chat } from "@pages/Chat/Chat";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route
            path="/login"
            element={
              <AuthLayout>
                <LoginForm />
              </AuthLayout>
            }
          />
          <Route
            path="/register"
            element={
              <AuthLayout>
                <RegisterForm />
              </AuthLayout>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <AuthLayout>
                <ForgotPasswordForm />
              </AuthLayout>
            }
          />
          <Route
            path="/reset-password"
            element={
              <AuthLayout>
                <ResetPasswordForm />
              </AuthLayout>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
