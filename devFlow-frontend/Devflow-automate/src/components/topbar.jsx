import { useEffect, useState } from "react";
import { stopWorkSession } from "../services/workSessionService";
import { getUnreadNotificationCount } from "../services/notificationService";

import {
  Bell,
  ChevronDown,
  LogOut,
  Sparkles,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

function Topbar() {
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = async () => {
    try {
      await stopWorkSession();
    } catch (error) {
      console.error("Logout session stop error:", error);
    } finally {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };
useEffect(() => {
  let mounted = true;

  const loadUnreadCount = async () => {
    try {
      const count = await getUnreadNotificationCount();

      if (mounted) {
        setUnreadCount(Number(count) || 0);
      }
    } catch (error) {
      console.error(
        "Failed to load notification count:",
        error
      );
    }
  };

  loadUnreadCount();

  // Update immediately when a notification is marked as read
  window.addEventListener(
    "notifications-updated",
    loadUnreadCount
  );

  return () => {
    mounted = false;

    window.removeEventListener(
      "notifications-updated",
      loadUnreadCount
    );
  };
}, []);


  return (
    <header className="relative z-30 flex h-16 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#080b12]/90 px-4 backdrop-blur-xl sm:px-6">

      {/* Left */}
      <div className="flex min-w-0 items-center gap-3">

        <div className="hidden h-8 w-px bg-white/[0.06] sm:block" />

        <div className="min-w-0">

          <div className="flex items-center gap-2">

            <Sparkles
              size={12}
              className="text-blue-400/80"
            />

            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-600">
              Workspace
            </p>

          </div>

          <h2 className="mt-0.5 truncate text-sm font-medium text-slate-300">
            Developer Dashboard
          </h2>

        </div>

      </div>

      {/* Right */}
      <div className="flex items-center gap-2">

        {/* Notifications */}
        <button
          type="button"
          onClick={() => navigate("/notifications")}
          aria-label="Notifications"
          className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.018] text-slate-500 transition hover:border-blue-400/15 hover:bg-blue-500/[0.05] hover:text-blue-400"
        >

          <Bell
            size={17}
            strokeWidth={1.8}
            className="transition-transform group-hover:-rotate-3"
          />

          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-blue-500 px-1 text-[9px] font-bold text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}

        </button>

        {/* Divider */}
        <div className="mx-1 hidden h-7 w-px bg-white/[0.06] sm:block" />

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="group flex h-10 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.018] px-3 text-sm text-slate-500 transition hover:border-white/[0.1] hover:bg-white/[0.04] hover:text-slate-200"
        >

          <LogOut
            size={15}
            className="transition group-hover:text-red-400"
          />

          <span className="hidden sm:inline">
            Logout
          </span>

        </button>

        {/* Online status */}
        <div className="hidden items-center gap-1.5 pl-1 sm:flex">

          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

          <span className="text-[10px] text-slate-700">
            Online
          </span>

          <ChevronDown
            size={12}
            className="text-slate-700"
          />

        </div>

      </div>

    </header>
  );
}

export default Topbar;