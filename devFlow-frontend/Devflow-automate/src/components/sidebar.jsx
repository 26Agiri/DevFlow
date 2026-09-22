import { stopWorkSession } from "../services/workSessionService";

import {
  Bell,
  ChevronRight,
  FolderKanban,
  History,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Sparkles,
  UserRound,
} from "lucide-react";

import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const linkClass = ({ isActive }) =>
    `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? "bg-blue-500/[0.08] text-white"
        : "text-slate-500 hover:bg-white/[0.035] hover:text-slate-200"
    }`;

  const handleLogout = async () => {
    try {
      await stopWorkSession();
    } catch (error) {
      console.error(
        "Logout session stop error:",
        error
      );
    } finally {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const isProjectArea =
    location.pathname.startsWith("/projects");

  const isTaskArea =
    location.pathname.startsWith("/tasks");

  const isHistoryArea =
    location.pathname.startsWith("/work-history");

  return (
    <aside className="hidden w-64 shrink-0 border-r border-white/[0.06] bg-[#090d14] lg:flex lg:min-h-screen lg:flex-col">

      {/* Brand */}

      <div className="border-b border-white/[0.06] px-5 py-5">

        <button
          type="button"
          onClick={() =>
            navigate("/dashboard")
          }
          className="group flex w-full items-center gap-3 text-left"
        >

          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/10 bg-blue-500/[0.08] text-sm font-bold text-blue-400">

            <span className="relative z-10">
              D
            </span>

            <div className="absolute inset-0 rounded-xl bg-blue-500/[0.08] blur-md transition group-hover:bg-blue-500/[0.14]" />

          </div>

          <div className="min-w-0">

            <h1 className="text-[15px] font-semibold tracking-tight text-white">
              DevFlow
            </h1>

            <p className="mt-0.5 text-[10px] text-slate-600">
              Developer workspace
            </p>

          </div>

        </button>

      </div>

      {/* Workspace */}

      <div className="px-3 py-6">

        <div className="flex items-center gap-2 px-3">

          <Sparkles
            size={11}
            className="text-blue-400/70"
          />

          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-700">
            Workspace
          </p>

        </div>

        <nav className="mt-3 space-y-1">

          {/* Dashboard */}

          <NavLink
            to="/dashboard"
            className={linkClass}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-blue-400" />
                )}

                <LayoutDashboard
                  size={17}
                  className={
                    isActive
                      ? "text-blue-400"
                      : "text-slate-600 transition group-hover:text-slate-300"
                  }
                />

                <span className="flex-1">
                  Dashboard
                </span>

                {isActive && (
                  <ChevronRight
                    size={14}
                    className="text-blue-400/60"
                  />
                )}
              </>
            )}
          </NavLink>

          {/* Projects */}

          <NavLink
            to="/projects"
            className={linkClass}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-blue-400" />
                )}

                <FolderKanban
                  size={17}
                  className={
                    isActive || isProjectArea
                      ? "text-blue-400"
                      : "text-slate-600 transition group-hover:text-slate-300"
                  }
                />

                <span className="flex-1">
                  Projects
                </span>

                {isActive && (
                  <ChevronRight
                    size={14}
                    className="text-blue-400/60"
                  />
                )}
              </>
            )}
          </NavLink>

          {/* Tasks */}

          <NavLink
            to="/tasks"
            className={linkClass}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-blue-400" />
                )}

                <ListTodo
                  size={17}
                  className={
                    isActive || isTaskArea
                      ? "text-blue-400"
                      : "text-slate-600 transition group-hover:text-slate-300"
                  }
                />

                <span className="flex-1">
                  Tasks
                </span>

                {isActive && (
                  <ChevronRight
                    size={14}
                    className="text-blue-400/60"
                  />
                )}
              </>
            )}
          </NavLink>

          {/* Work History */}

          <NavLink
            to="/work-history"
            className={linkClass}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-blue-400" />
                )}

                <History
                  size={17}
                  className={
                    isActive || isHistoryArea
                      ? "text-blue-400"
                      : "text-slate-600 transition group-hover:text-slate-300"
                  }
                />

                <span className="flex-1">
                  Work History
                </span>

                {isActive && (
                  <ChevronRight
                    size={14}
                    className="text-blue-400/60"
                  />
                )}
              </>
            )}
          </NavLink>

          {/* Profile */}

          <NavLink
            to="/profile"
            className={linkClass}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-blue-400" />
                )}

                <UserRound
                  size={17}
                  className={
                    isActive
                      ? "text-blue-400"
                      : "text-slate-600 transition group-hover:text-slate-300"
                  }
                />

                <span className="flex-1">
                  Profile
                </span>

                {isActive && (
                  <ChevronRight
                    size={14}
                    className="text-blue-400/60"
                  />
                )}
              </>
            )}
          </NavLink>

          {/* Notifications */}

          <NavLink
            to="/notifications"
            className={linkClass}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-blue-400" />
                )}

                <Bell
                  size={17}
                  className={
                    isActive
                      ? "text-blue-400"
                      : "text-slate-600 transition group-hover:text-slate-300"
                  }
                />

                <span className="flex-1">
                  Notifications
                </span>

                {isActive && (
                  <ChevronRight
                    size={14}
                    className="text-blue-400/60"
                  />
                )}
              </>
            )}
          </NavLink>

        </nav>

      </div>

      {/* Bottom workspace card */}

      <div className="mt-auto px-3 pb-3">

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.018] p-4">

          <div className="flex items-center gap-2">

            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
              Workspace ready
            </span>

          </div>

          <p className="mt-2 text-xs leading-5 text-slate-600">
            Keep projects, tasks and team activity
            moving from one place.
          </p>

        </div>

      </div>

      {/* Logout */}

      <div className="border-t border-white/[0.06] p-3">

        <button
          type="button"
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-red-500/[0.04] hover:text-slate-200"
        >

          <LogOut
            size={17}
            className="text-slate-600 transition group-hover:text-red-400"
          />

          <span className="flex-1 text-left">
            Logout
          </span>

        </button>

      </div>

    </aside>
  );
}

export default Sidebar;