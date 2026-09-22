import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  CircleCheck,
  Clock3,
  Info,
  Sparkles,
} from "lucide-react";
import api from "../services/api";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      setError("");

      const response = await api.get("/notifications");

      setNotifications(response.data);
    } catch (error) {
      console.error("Notifications error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      setError("");

      await api.put(
        `/notifications/${notificationId}/read`
      );

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );
    } catch (error) {
      console.error("Mark read error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to mark notification as read."
      );
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const readCount = notifications.length - unreadCount;

  const recentNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      const first = new Date(a.createdAt || 0).getTime();
      const second = new Date(b.createdAt || 0).getTime();

      return second - first;
    });
  }, [notifications]);

  const getIcon = (notification) => {
    if (notification.isRead) {
      return (
        <CircleCheck
          size={18}
          className="text-slate-600"
        />
      );
    }

    return (
      <Bell
        size={18}
        className="text-blue-400"
      />
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#080b12]">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-blue-400" />

          <p className="mt-4 text-sm text-slate-500">
            Loading notifications...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full overflow-hidden bg-[#080b12]">
      {/* Ambient workspace lighting */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-blue-500/[0.06] blur-[120px]" />

        <div className="absolute right-0 top-48 h-96 w-96 rounded-full bg-cyan-400/[0.03] blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.022]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl p-5 sm:p-6 lg:p-8">
        {/* Header */}
        <section className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0c111a]/90 shadow-2xl shadow-black/20">
          <div className="relative p-6 sm:p-8">
            <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-blue-500/[0.05] blur-[90px]" />

            <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-blue-400">
                  <Sparkles size={13} />
                  Workspace Activity
                </div>

                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Notifications
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                  Stay on top of assignments, task updates
                  and activity across your workspace.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-blue-400/10 bg-blue-500/[0.05] px-4 py-3">
                <Bell
                  size={15}
                  className="text-blue-400"
                />

                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-slate-600">
                    Unread
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-slate-200">
                    {unreadCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="grid border-t border-white/[0.06] sm:grid-cols-3">
            <div className="border-b border-white/[0.06] px-6 py-5 sm:border-b-0 sm:border-r sm:px-8">
              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <Bell size={13} />
                Total notifications
              </div>

              <p className="mt-2 text-2xl font-semibold text-white">
                {notifications.length}
              </p>
            </div>

            <div className="border-b border-white/[0.06] px-6 py-5 sm:border-b-0 sm:border-r sm:px-8">
              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <Info
                  size={13}
                  className="text-blue-400"
                />
                Needs attention
              </div>

              <p className="mt-2 text-2xl font-semibold text-white">
                {unreadCount}
              </p>
            </div>

            <div className="px-6 py-5 sm:px-8">
              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <CheckCheck
                  size={13}
                  className="text-emerald-400"
                />
                Read
              </div>

              <p className="mt-2 text-2xl font-semibold text-white">
                {readCount}
              </p>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-2xl border border-red-500/10 bg-red-500/[0.05] px-5 py-4 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Notification list */}
        {notifications.length === 0 ? (
          <section className="mt-5 rounded-3xl border border-white/[0.07] bg-[#0c111a]/90 p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025]">
              <Bell
                size={22}
                className="text-slate-600"
              />
            </div>

            <h2 className="mt-5 text-base font-semibold text-white">
              You're all caught up
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-600">
              New workspace activity will appear here when
              something needs your attention.
            </p>
          </section>
        ) : (
          <section className="mt-5 overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0c111a]/90">
            <div className="border-b border-white/[0.06] px-5 py-5 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-white">
                    Activity Feed
                  </h2>

                  <p className="mt-1 text-xs text-slate-600">
                    Recent events from your workspace.
                  </p>
                </div>

                <span className="rounded-full bg-white/[0.04] px-2.5 py-1 text-[10px] text-slate-500">
                  {notifications.length}
                </span>
              </div>
            </div>

            <div className="divide-y divide-white/[0.05]">
              {recentNotifications.map(
                (notification) => (
                  <article
                    key={notification.id}
                    className={`group p-5 transition sm:p-6 ${
                      notification.isRead
                        ? "hover:bg-white/[0.012]"
                        : "bg-blue-500/[0.018] hover:bg-blue-500/[0.025]"
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                          notification.isRead
                            ? "border-white/[0.06] bg-white/[0.025]"
                            : "border-blue-400/10 bg-blue-500/[0.07]"
                        }`}
                      >
                        {getIcon(notification)}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              {!notification.isRead && (
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                              )}

                              <p
                                className={`text-sm leading-6 ${
                                  notification.isRead
                                    ? "text-slate-500"
                                    : "font-medium text-slate-200"
                                }`}
                              >
                                {notification.message}
                              </p>
                            </div>

                            {notification.createdAt && (
                              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-700">
                                <Clock3 size={11} />

                                {new Date(
                                  notification.createdAt
                                ).toLocaleString()}
                              </div>
                            )}
                          </div>

                          {!notification.isRead && (
                            <button
                              type="button"
                              onClick={() =>
                                handleMarkAsRead(
                                  notification.id
                                )
                              }
                              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/[0.08] px-3 py-2 text-[11px] font-medium text-slate-400 transition hover:border-blue-400/20 hover:bg-blue-500/[0.06] hover:text-blue-400"
                            >
                              <CheckCheck size={13} />
                              Mark as read
                            </button>
                          )}

                          {notification.isRead && (
                            <span className="inline-flex shrink-0 items-center gap-1.5 text-[10px] text-slate-700">
                              <CircleCheck size={12} />
                              Read
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default Notifications;