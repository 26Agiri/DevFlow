import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./layouts/DashboardLayout";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Notifications from "./pages/Notifications";
import ProjectDetails from "./pages/ProjectDetails";
import TaskDetails from "./pages/TaskDetails";
import WorkHistory from "./pages/WorkHistory";
import Profile from "./pages/Profile";

function ProtectedRoute() {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout />;
}

function PublicRoute({ children }) {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected application */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/projects"
            element={<Projects />}
          />

          <Route
            path="/projects/:projectId"
            element={<ProjectDetails />}
          />

          <Route
            path="/tasks"
            element={<Tasks />}
          />

          <Route
            path="/projects/:projectId/tasks/:taskId"
            element={<TaskDetails />}
          />

          <Route
            path="/notifications"
            element={<Notifications />}
          />

          <Route
            path="/work-history"
            element={<WorkHistory />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

        </Route>

        {/* Default */}

        <Route
          path="/"
          element={
            <Navigate to="/dashboard" replace />
          }
        />

        {/* Unknown route */}

        <Route
          path="*"
          element={
            <Navigate to="/dashboard" replace />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;