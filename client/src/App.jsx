import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import About from "./components/About";
import Bids from "./components/BidingsPage/Bids";
import Projects from "./components/ProjectPages/Projects";
import Dashboard from "./components/dashboard/Dashboard";
import JobDetails from "./components/Jobs/JobDetails";
import PostJob from "./components/Jobs/PostJob";
import Features from "./components/Features/FeaturesPage";
import Jobs from "./components/JobsPage/Jobs";
import LandingPage from "./components/LandingPage/LandingPage";
import Marketplace from "./components/MarketPlace/MarketPlace";
import Navbar from "./components/Navbar";
import ProfilePage from "./components/ProfilePage/ProfilePage";
import ProfileSettings from "./components/ProfilePage/ProfileSettings";
import LoginPage from "./components/RegistrationPages/Login";
import SignupPage from "./components/RegistrationPages/Signup";
import AdminLogin from "./components/admin/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminUsers from "./components/admin/AdminUsers";
import AdminJobs from "./components/admin/AdminJobs";
import AdminAnalytics from "./components/admin/AdminAnalytics";
import TransactionPage from "./components/TransactionPage/TransactionPage";
import { useSelector } from "react-redux";
import Footer from "./components/Footer";
import NotificationsPage from "./components/Notifications/NotificationsPage";
import { useEffect } from "react";
import ChatPage from "./components/Chat/ChatPage";
import { initializeSocket, disconnectSocket } from "./api/socketService";
import { selectAccessToken } from "./redux/Features/user/authSlice";
import PropTypes from "prop-types";

// Protected Route component for user routes
const ProtectedRoute = ({ children }) => {
  const { accessToken } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

// Protected Route component for admin routes
const AdminProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.admin);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

AdminProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

function App() {
  const location = useLocation();
  const hideNavbarRoutes = [
    "/login",
    "/signup",
    "/admin",
    "/admin/login",
    "/admin/dashboard",
    "/admin/users",
    "/admin/jobs",
    "/admin/reports",
    "/admin/analytics",
  ];

  const accessToken = useSelector(selectAccessToken);
  const isDashboardRoute = location.pathname?.startsWith("/dashboard");

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (accessToken) {
      console.log("Initializing socket connection with token");
      const socket = initializeSocket(accessToken);

      // Log socket connection status
      if (socket) {
        console.log("Socket initialized successfully");
      } else {
        console.warn("Failed to initialize socket");
      }
    } else {
      console.log("No access token, not initializing socket");
    }

    // Cleanup socket connection on unmount
    return () => {
      console.log("Cleaning up socket connection");
      disconnectSocket();
    };
  }, [accessToken]);

  return (
    <div className="flex flex-col min-h-screen justify-between">
      {!hideNavbarRoutes.includes(location.pathname) && <Navbar />}

      <main className={`w-full${isDashboardRoute ? "flex" : ""} h-full`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/profile" element={<ProfileSettings />} />
          <Route path="/user/:username" element={<ProfilePage />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/jobs/new" element={<PostJob />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/jobs" element={<Jobs />} />
          <Route path="/dashboard/bids" element={<Bids />} />
          <Route path="dashboard/projects" element={<Projects />} />
          <Route path="/about" element={<About />} />
          <Route
            path="dashboard/transactions/*"
            element={<TransactionPage />}
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={<Navigate to="/admin/login" replace />}
          />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="jobs" element={<AdminJobs />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>

          <Route path="/features" element={<Features />} />

          {/* Chat Routes */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:chatId"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {!hideNavbarRoutes.includes(location.pathname) && (
        <footer className={isDashboardRoute ? "ml-56" : ""}>
          <Footer />
        </footer>
      )}
    </div>
  );
}

export function APPwithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}
