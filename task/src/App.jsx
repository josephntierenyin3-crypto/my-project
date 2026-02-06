import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { TaskProvider } from "./context/TaskContext";
import { WorkProvider } from "./context/WorkContext";
import Landing from "./Compnonent/Landing/Landing";
import WorkDashboard from "./Compnonent/WorkDashboard/WorkDashboard";
import Admin from "./Compnonent/Admin/Admin";
import LoginPage from "./Compnonent/Login/Login";
import RegistrationPage from "./Compnonent/Registration/Registration";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = React.useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === "admin" ? "/admin" : "/user"} replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <WorkProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegistrationPage />} />
              <Route
                path="/user"
                element={
                  <ProtectedRoute>
                    <WorkDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Admin />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </WorkProvider>
      </TaskProvider>
    </AuthProvider>
  );
}

export default App;
