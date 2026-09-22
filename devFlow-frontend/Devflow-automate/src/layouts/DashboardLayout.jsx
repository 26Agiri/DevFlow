import { useEffect, useState } from "react";

import {
  Bell,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  LockKeyhole,
  LogIn,
  Play,
  RefreshCw,
} from "lucide-react";

import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import Sidebar from "../components/sidebar";
import Topbar from "../components/topbar";

import {
  getWorkSessionStatus,
  resumeWorkSession,
  sendWorkSessionHeartbeat,
} from "../services/workSessionService";

function DashboardLayout() {
  const navigate = useNavigate();

  const [sessionStatus, setSessionStatus] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState("");

  const mobileLinkClass = ({ isActive }) =>
    `group relative flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2.5 text-[10px] font-medium transition ${
      isActive
        ? "bg-blue-500/[0.08] text-blue-400"
        : "text-slate-600 hover:bg-white/[0.025] hover:text-slate-300"
    }`;

  const checkWorkSession = async () => {
    try {
      const data = await getWorkSessionStatus();

      const status =
        data?.sessionStatus ||
        (data?.active ? "ACTIVE" : "INACTIVE");

      setSessionStatus(status);
    } catch (error) {
      console.error(
        "Workspace session check failed:",
        error
      );
    } finally {
      setCheckingSession(false);
    }
  };

  useEffect(() => {
    checkWorkSession();

    const interval = setInterval(
      checkWorkSession,
      5000
    );

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
  if (sessionStatus !== "ACTIVE") {
    return;
  }

  const sendHeartbeat = async () => {
    if (document.visibilityState !== "visible") {
      return;
    }

    try {
      await sendWorkSessionHeartbeat();

      console.log(
        "DevFlow workspace heartbeat sent"
      );
    } catch (error) {
      console.error(
        "Workspace heartbeat failed:",
        error
      );
    }
  };

  // Send one heartbeat immediately when the workspace
  // becomes active.
  sendHeartbeat();

  // Keep the session alive while the DevFlow tab
  // remains visible.
  const heartbeatTimer = setInterval(
    sendHeartbeat,
    60000
  );

  // When the user returns to the DevFlow tab,
  // send a heartbeat immediately.
  const handleVisibilityChange = () => {
    if (
      document.visibilityState === "visible"
    ) {
      sendHeartbeat();
    }
  };

  document.addEventListener(
    "visibilitychange",
    handleVisibilityChange
  );

  return () => {
    clearInterval(heartbeatTimer);

    document.removeEventListener(
      "visibilitychange",
      handleVisibilityChange
    );
  };
}, [sessionStatus]);
  const handleResume = async () => {
    try {
      setResumeLoading(true);
      setResumeError("");

      await resumeWorkSession();

      await checkWorkSession();
    } catch (error) {
      console.error(
        "Resume work session failed:",
        error
      );

      setResumeError(
        error?.response?.data?.message ||
          "Unable to resume the work session."
      );
    } finally {
      setResumeLoading(false);
    }
  };

  const handleReturnToLogin = () => {
    localStorage.removeItem("token");
    navigate("/login", {
      replace: true,
    });
  };

  /*
   * While checking the session, don't expose
   * the workspace.
   */
  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080b12] text-slate-200">
        <div className="text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.02]">
            <RefreshCw
              size={19}
              className="animate-spin text-blue-400"
            />
          </div>

          <p className="mt-4 text-sm font-medium text-white">
            Checking work session
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Preparing your workspace...
          </p>

        </div>
      </div>
    );
  }

  /*
   * PAUSED
   *
   * The workspace is locked because the timer
   * is stopped, but the employee can resume.
   */
  if (sessionStatus === "PAUSED") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080b12] px-5 text-slate-200">

        <div className="w-full max-w-md rounded-3xl border border-white/[0.07] bg-[#0c111a]/95 p-7 text-center shadow-2xl shadow-black/20 sm:p-9">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/10 bg-amber-400/[0.06]">
            <LockKeyhole
              size={22}
              className="text-amber-400"
            />
          </div>

          <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400/80">
            Workspace Locked
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            Work session paused
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
            Your work timer is currently paused, so workspace activities are temporarily locked.
          </p>

          {resumeError && (
            <div className="mt-5 rounded-xl border border-red-400/10 bg-red-400/[0.05] px-4 py-3 text-xs text-red-300">
              {resumeError}
            </div>
          )}

          <button
            type="button"
            onClick={handleResume}
            disabled={resumeLoading}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-blue-500/10 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resumeLoading ? (
              <RefreshCw
                size={15}
                className="animate-spin"
              />
            ) : (
              <Play
                size={15}
                fill="currentColor"
              />
            )}

            {resumeLoading
              ? "Resuming..."
              : "Resume Work Session"}
          </button>

        </div>

      </div>
    );
  }

  /*
   * INACTIVE
   *
   * Session has ended because of logout,
   * stale heartbeat, midnight closure, etc.
   */
  if (sessionStatus === "INACTIVE") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080b12] px-5 text-slate-200">

        <div className="w-full max-w-md rounded-3xl border border-white/[0.07] bg-[#0c111a]/95 p-7 text-center shadow-2xl shadow-black/20 sm:p-9">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025]">
            <LockKeyhole
              size={22}
              className="text-slate-400"
            />
          </div>

          <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
            Workspace Locked
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            Work session inactive
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
            Your work session has ended, so workspace activities are no longer available.
          </p>

          <button
            type="button"
            onClick={handleReturnToLogin}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
          >
            <LogIn size={15} />
            Return to Login
          </button>

        </div>

      </div>
    );
  }

  /*
   * ACTIVE
   *
   * Normal DevFlow workspace.
   */
  return (
    <div className="min-h-screen bg-[#080b12] text-slate-200">

      <div className="flex min-h-screen">

        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Application */}
        <div className="flex min-w-0 flex-1 flex-col">

          <Topbar />

          <main className="min-h-0 flex-1 overflow-y-auto pb-24 lg:pb-0">
            <Outlet />
          </main>

        </div>

      </div>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.07] bg-[#090d14]/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl lg:hidden">

        <div className="mx-auto flex max-w-md items-center gap-1 rounded-2xl border border-white/[0.05] bg-[#0c111a]/95 p-1">

          <NavLink
            to="/dashboard"
            className={mobileLinkClass}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute top-1 h-0.5 w-6 rounded-full bg-blue-400" />
                )}

                <LayoutDashboard
                  size={18}
                  strokeWidth={isActive ? 2 : 1.7}
                  className={
                    isActive
                      ? "text-blue-400"
                      : "text-slate-600 transition group-hover:text-slate-300"
                  }
                />

                <span>
                  Dashboard
                </span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/projects"
            className={mobileLinkClass}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute top-1 h-0.5 w-6 rounded-full bg-blue-400" />
                )}

                <FolderKanban
                  size={18}
                  strokeWidth={isActive ? 2 : 1.7}
                  className={
                    isActive
                      ? "text-blue-400"
                      : "text-slate-600 transition group-hover:text-slate-300"
                  }
                />

                <span>
                  Projects
                </span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/tasks"
            className={mobileLinkClass}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute top-1 h-0.5 w-6 rounded-full bg-blue-400" />
                )}

                <ListTodo
                  size={18}
                  strokeWidth={isActive ? 2 : 1.7}
                  className={
                    isActive
                      ? "text-blue-400"
                      : "text-slate-600 transition group-hover:text-slate-300"
                  }
                />

                <span>
                  Tasks
                </span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/notifications"
            className={mobileLinkClass}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute top-1 h-0.5 w-6 rounded-full bg-blue-400" />
                )}

                <div className="relative">

                  <Bell
                    size={18}
                    strokeWidth={isActive ? 2 : 1.7}
                    className={
                      isActive
                        ? "text-blue-400"
                        : "text-slate-600 transition group-hover:text-slate-300"
                    }
                  />

                  <span className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-blue-400" />

                </div>

                <span>
                  Notifications
                </span>
              </>
            )}
          </NavLink>

        </div>

      </nav>

    </div>
  );
}

export default DashboardLayout;