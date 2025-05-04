import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import AdminLayout from "../components/admin/AdminLayout";
import AdminLogin from "../components/admin/AdminLogin";
import AdminDashboard from "../components/admin/AdminDashboard";
import ErrorBoundary from "../components/ErrorBoundary";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.admin);

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return children || <Outlet />;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node,
};

// Admin routes configuration
export const adminRoutes = [
  {
    path: "/admin",
    element: <Navigate to="/admin/login" replace />,
  },
  {
    path: "/admin/login",
    element: (
      <ErrorBoundary>
        <AdminLogin />
      </ErrorBoundary>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <ErrorBoundary>
          <AdminLayout />
        </ErrorBoundary>
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: (
          <ErrorBoundary>
            <AdminDashboard />
          </ErrorBoundary>
        ),
      },
      // Add more admin routes here as needed
      {
        path: "*",
        element: <Navigate to="/admin/dashboard" replace />,
      },
    ],
  },
];
