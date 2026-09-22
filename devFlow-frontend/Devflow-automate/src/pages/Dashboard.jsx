import { useEffect, useMemo, useRef, useState } from "react";

import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  Circle,
  Clock3,
  FolderKanban,
  ListTodo,
  RefreshCw,
  Target,
  Zap,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import api from "../services/api";

import {
  pauseWorkSession,
  resumeWorkSession,
  getWorkSessionStatus,
} from "../services/workSessionService";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [workSession, setWorkSession] = useState(null);
  const [workLoading, setWorkLoading] = useState(true);
  const [workActionLoading, setWorkActionLoading] = useState(false);

  const [liveSessionSeconds, setLiveSessionSeconds] = useState(0);
  const [liveWeeklyRemainingSeconds, setLiveWeeklyRemainingSeconds] =
    useState(0);

  const [motivationIndex, setMotivationIndex] = useState(0);

  /*
   * Timer synchronization reference.
   *
   * serverSeconds = value received from backend
   * syncedAt      = browser time when backend value was received
   */
  const sessionTimerRef = useRef({
    serverSeconds: 0,
    syncedAt: 0,
  });

  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      setError("");

      const response = await api.get("/dashboard");

      setStats(response.data);
    } catch (error) {
      console.error("Dashboard error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  /*
   * Get the authoritative session status from the backend.
   * This runs every 10 seconds.
   */
  useEffect(() => {
    const fetchWorkSession = async () => {
      try {
        const data = await getWorkSessionStatus();

        setWorkSession(data);

        setLiveWeeklyRemainingSeconds(
          data.weeklyRemainingSeconds || 0
        );

        if (data.active) {
          const serverSeconds =
            Number(data.activeSessionSeconds) || 0;

          sessionTimerRef.current = {
            serverSeconds,
            syncedAt: Date.now(),
          };

          setLiveSessionSeconds(serverSeconds);
        } else {
          sessionTimerRef.current = {
            serverSeconds: 0,
            syncedAt: 0,
          };

          setLiveSessionSeconds(0);
        }
      } catch (error) {
        console.error(
          "Work session error:",
          error
        );
      } finally {
        setWorkLoading(false);
      }
    };

    fetchWorkSession();

    const interval = setInterval(
      fetchWorkSession,
      10000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  /*
   * Continuous session timer.
   *
   * The backend gives us the last authoritative value.
   * The browser calculates the time that has passed since
   * that value was received, so the displayed timer keeps
   * moving continuously instead of waiting for API calls.
   */
  useEffect(() => {
    if (!workSession?.active) {
      return;
    }

    const timer = setInterval(() => {
      const {
        serverSeconds,
        syncedAt,
      } = sessionTimerRef.current;

      if (!syncedAt) {
        return;
      }

      const elapsedSinceSync = Math.floor(
        (Date.now() - syncedAt) / 1000
      );

      setLiveSessionSeconds(
        serverSeconds + elapsedSinceSync
      );

      setLiveWeeklyRemainingSeconds(
        (current) =>
          Math.max(current - 1, 0)
      );
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [workSession?.active]);

  

  const totalProjects =
    stats?.totalProjects || 0;

  const weeklyWorkedSeconds =
    workSession?.weeklyWorkedSeconds || 0;

  const weeklyRemainingSeconds =
    workSession?.weeklyRemainingSeconds || 0;

  const weeklyTargetSeconds =
    workSession?.weeklyTargetSeconds ||
    35 * 60 * 60;

  const workingDaysRemaining =
    workSession?.workingDaysRemaining || 0;

  const weeklyWarningLevel =
    workSession?.weeklyWarningLevel ||
    "NORMAL";

  const weeklyProgressPercentage =
    weeklyTargetSeconds
      ? Math.min(
          Math.round(
            (weeklyWorkedSeconds /
              weeklyTargetSeconds) *
              100
          ),
          100
        )
      : 0;

  const motivationalMessages = [
    "Stay consistent. Small progress builds strong weeks.",
    "Keep the momentum going. You're making progress.",
    "One focused session at a time.",
    "Stay disciplined. Let the week take care of itself.",
    "Keep moving forward. Your progress is building.",
  ];

  const weeklyWarningMessage =
    weeklyWarningLevel === "NORMAL"
      ? motivationalMessages[motivationIndex]
      : weeklyWarningLevel === "WARNING"
        ? "Your weekly target is getting tight. Plan your remaining hours carefully."
        : weeklyWarningLevel === "STRICT"
          ? "Weekly target at risk. You need to complete the remaining hours before the week ends."
          : "Weekly work target completed. Great work this week.";

  const totalTasks =
    stats?.totalTasks || 0;

  const todoTasks =
    stats?.todoTasks || 0;

  const inProgressTasks =
    stats?.inProgressTasks || 0;

  const completedTasks =
    stats?.completedTasks || 0;

  const unreadNotifications =
    stats?.unreadNotifications || 0;

  const lowPriorityTasks =
    stats?.lowPriorityTasks || 0;

  const mediumPriorityTasks =
    stats?.mediumPriorityTasks || 0;

  const highPriorityTasks =
    stats?.highPriorityTasks || 0;

  const todoPercentage =
    totalTasks
      ? Math.round(
          (todoTasks / totalTasks) * 100
        )
      : 0;

  const progressPercentage =
    totalTasks
      ? Math.round(
          (inProgressTasks / totalTasks) * 100
        )
      : 0;

  const completedPercentage =
    totalTasks
      ? Math.round(
          (completedTasks / totalTasks) * 100
        )
      : 0;

  const completionRate =
    completedPercentage;

  const activeRate =
    progressPercentage;

  const priorityTotal = useMemo(
    () =>
      lowPriorityTasks +
      mediumPriorityTasks +
      highPriorityTasks,
    [
      lowPriorityTasks,
      mediumPriorityTasks,
      highPriorityTasks,
    ]
  );

  const lowPercentage =
    priorityTotal
      ? Math.round(
          (lowPriorityTasks /
            priorityTotal) *
            100
        )
      : 0;

  const mediumPercentage =
    priorityTotal
      ? Math.round(
          (mediumPriorityTasks /
            priorityTotal) *
            100
        )
      : 0;

  const highPercentage =
    priorityTotal
      ? Math.round(
          (highPriorityTasks /
            priorityTotal) *
            100
        )
      : 0;

  const focusSignal =
    highPriorityTasks > 0
      ? "HIGH ATTENTION"
      : inProgressTasks > 0
        ? "EXECUTION ACTIVE"
        : totalTasks > 0
          ? "READY TO EXECUTE"
          : "WORKSPACE READY";

  const focusSignalClass =
    highPriorityTasks > 0
      ? "text-rose-400"
      : inProgressTasks > 0
        ? "text-blue-400"
        : "text-emerald-400";

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#080b12]">
        <div className="text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.07] bg-[#0d121b]">
            <RefreshCw
              size={18}
              className="animate-spin text-blue-400"
            />
          </div>

          <p className="mt-4 text-sm font-medium text-white">
            Loading workspace
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Preparing your DevFlow command center...
          </p>
        </div>
      </div>
    );
  }
  const formatTime = (seconds = 0) => {
  const totalSeconds = Math.max(0, Math.floor(seconds));

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  return [hours, minutes, secs]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};

const formatHoursMinutes = (seconds = 0) => {
  const totalMinutes = Math.floor(Math.max(0, seconds) / 60);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
};

  if (error) {
    return (
      <div className="min-h-full bg-[#080b12] p-5 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-500/10 bg-red-500/[0.04] p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
                <AlertCircle
                  size={17}
                  className="text-red-400"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-red-300">
                  Dashboard unavailable
                </p>

                <p className="mt-1 text-xs leading-5 text-red-400/70">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={fetchDashboard}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-500/10 px-3 py-2 text-xs text-red-300 transition hover:bg-red-500/[0.05]"
                >
                  <RefreshCw size={13} />
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full overflow-hidden bg-[#080b12] text-white">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-0 h-[420px] w-[420px] rounded-full bg-blue-500/[0.055] blur-[130px]" />

        <div className="absolute right-[-8%] top-[20%] h-[480px] w-[480px] rounded-full bg-cyan-400/[0.025] blur-[150px]" />

        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1500px] p-5 sm:p-6 lg:p-8">

        {/* =========================================================
            COMMAND CENTER
        ========================================================= */}
        <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#0b1018]/95 shadow-2xl shadow-black/20">
          <div className="pointer-events-none absolute right-[-80px] top-[-100px] h-80 w-80 rounded-full bg-blue-500/[0.07] blur-[110px]" />

          <div className="pointer-events-none absolute bottom-[-110px] left-[38%] h-72 w-72 rounded-full bg-cyan-400/[0.025] blur-[110px]" />

          <div className="relative grid xl:grid-cols-[1fr_330px]">
            {/* Hero */}
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />

                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>

                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-300">
                  DevFlow Command Center
                </span>
              </div>

              <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl lg:text-5xl">
                Turn ideas into
                <span className="text-blue-400">
                  {" "}
                  progress.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                One operational view of your projects,
                execution pipeline, priorities and workspace
                activity.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/projects")}
                  className="group inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:-translate-y-0.5 hover:border-white/[0.13] hover:bg-white/[0.045] hover:text-white"
                >
                  <FolderKanban size={15} />
                  Projects
                  <ArrowUpRight
                    size={14}
                    className="text-slate-600 transition group-hover:text-blue-400"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/tasks")}
                  className="group inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/10 transition hover:-translate-y-0.5 hover:bg-blue-400"
                >
                  <ListTodo size={15} />
                  Open Tasks
                  <ArrowUpRight
                    size={14}
                    className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </button>
              </div>

              {/* Operational signal */}
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/[0.06] pt-5">
                <div className="flex items-center gap-2">
                  <Zap
                    size={13}
                    className="text-blue-400"
                  />

                  <span className="text-[11px] text-slate-600">
                    Workspace active
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Target
                    size={13}
                    className="text-emerald-400"
                  />

                  <span className="text-[11px] text-slate-600">
                    {completionRate}% completed
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Activity
                    size={13}
                    className="text-cyan-400"
                  />

                  <span className="text-[11px] text-slate-600">
                    {activeRate}% active
                  </span>
                </div>
              </div>
            </div>

            {/* Signal panel */}
            <div className="border-t border-white/[0.06] bg-white/[0.012] p-6 xl:border-l xl:border-t-0 sm:p-8">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-700">
                Current signal
              </p>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/[0.07]">
                  <Activity
                    size={18}
                    className={focusSignalClass}
                  />
                </div>

                <div>
                  <p
                    className={`text-xs font-semibold tracking-wide ${focusSignalClass}`}
                  >
                    {focusSignal}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-700">
                    Workspace status
                  </p>
                </div>
              </div>

              <div className="mt-7 rounded-2xl border border-white/[0.06] bg-[#080b12] p-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.18em] text-slate-700">
                      Notifications
                    </p>

                    <p className="mt-2 text-4xl font-semibold text-white">
                      {unreadNotifications}
                    </p>
                  </div>

                  <Bell
                    size={17}
                    className={
                      unreadNotifications > 0
                        ? "text-blue-400"
                        : "text-slate-700"
                    }
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/notifications")
                  }
                  className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-600 transition hover:text-blue-400"
                >
                  Review activity
                  <ArrowUpRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            METRICS
        ========================================================= */}
        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* =========================================================
    WORK SESSION
======
{/* =========================================================
    WORK SESSION
========================================================= */}
<section className="mt-5 sm:col-span-2 xl:col-span-4">
  <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0c111a]/95 shadow-2xl shadow-black/10">
    
    {/* subtle ambient light */}
    <div className="pointer-events-none absolute right-[-120px] top-[-120px] h-80 w-80 rounded-full bg-blue-500/[0.05] blur-[120px]" />

    <div className="relative p-6 sm:p-7 lg:p-8">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Clock3 size={14} className="text-blue-400" />

            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-blue-400">
              Work session
            </span>
          </div>
          </div>

          <h2 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
            {workSession?.active
              ? "Focus session active"
              : "Ready to work"}
          </h2>

          <p className="mt-1 max-w-xl text-xs leading-5 text-slate-600">
            Track your working time and stay on pace with your
            weekly 35-hour target.
          </p>
        </div>

        {/* Status */}
        <div
          className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.15em] ${
            workSession?.active
              ? "border-emerald-400/[0.15] bg-emerald-400/[0.05] text-emerald-400"
              : "border-white/[0.07] bg-white/[0.025] text-slate-600"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              workSession?.active
                ? "bg-emerald-400"
                : "bg-slate-600"
            }`}
          />

          {workSession?.active ? "Active" : "Idle"}
        </div>
      </div>

      {/* Main stats */}
      <div className="mt-7 grid gap-4 lg:grid-cols-2">

        {/* Current session */}
        <div className="rounded-2xl border border-blue-400/[0.08] bg-blue-400/[0.025] p-5">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Current session
            </p>

            <Activity
              size={14}
              className={
                workSession?.active
                  ? "text-blue-400"
                  : "text-slate-700"
              }
            />
          </div>

          <p className="mt-4 font-mono text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {formatTime(liveSessionSeconds)}
          </p>

          <p className="mt-2 text-[10px] text-slate-600">
            Live working time
          </p>
        </div>
       {/* Weekly balance */}
<div className="relative overflow-hidden rounded-2xl border border-blue-400/[0.10] bg-blue-400/[0.025] p-5">
  <div className="pointer-events-none absolute right-[-60px] top-[-60px] h-40 w-40 rounded-full bg-blue-500/[0.08] blur-[70px]" />

  <div className="relative">
    <div className="flex items-center justify-between">
      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-blue-300/70">
        Weekly time remaining
      </p>

      <Target size={14} className="text-blue-400" />
    </div>

    <p className="mt-4 font-mono text-4xl font-semibold tracking-tight text-white sm:text-5xl">
      {formatTime(liveWeeklyRemainingSeconds)}
    </p>

    <div className="mt-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-[10px] text-slate-600">
          {formatHoursMinutes(weeklyWorkedSeconds)} worked
          <span className="mx-1.5 text-slate-800">/</span>
          35h target
        </p>
      </div>

      <div className="text-right">
        <p className="text-lg font-semibold text-white">
          {workingDaysRemaining}
        </p>

        <p className="text-[9px] uppercase tracking-[0.15em] text-slate-700">
          working days left
        </p>
      </div>
    </div>
  </div>
</div>

      {/* Weekly progress */}
      <div className="mt-5 rounded-2xl border border-white/[0.06] bg-[#080b12] p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Weekly progress
            </p>

            <p className="mt-1 text-[10px] text-slate-700">
              {formatHoursMinutes(weeklyWorkedSeconds)} completed
            </p>
          </div>

          <p className="text-sm font-semibold text-white">
            {weeklyProgressPercentage}%
          </p>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.05]">
          <div
            className="h-full rounded-full bg-blue-400 transition-all duration-700"
            style={{
              width: `${weeklyProgressPercentage}%`,
            }}
          />
        </div>

        <div className="mt-2 flex justify-between text-[9px] text-slate-700">
          <span>0h</span>
          <span>35h target</span>
        </div>
      </div>

      {/* Warning / motivation */}
    
<div
  className={`mt-5 rounded-2xl border p-4 transition ${
    weeklyWarningLevel === "STRICT"
      ? "border-rose-400/25 bg-rose-400/[0.06] shadow-lg shadow-rose-500/[0.05]"
      : weeklyWarningLevel === "WARNING"
        ? "border-amber-400/20 bg-amber-400/[0.05]"
        : weeklyWarningLevel === "COMPLETED"
          ? "border-emerald-400/20 bg-emerald-400/[0.05]"
          : "border-white/[0.06] bg-white/[0.015]"
  }`}
>
  <div className="flex items-start gap-3">

    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
        weeklyWarningLevel === "STRICT"
          ? "bg-rose-400/[0.10]"
          : weeklyWarningLevel === "WARNING"
            ? "bg-amber-400/[0.10]"
            : weeklyWarningLevel === "COMPLETED"
              ? "bg-emerald-400/[0.10]"
              : "bg-blue-400/[0.07]"
      }`}
    >
      {weeklyWarningLevel === "STRICT" ? (
        <AlertCircle
          size={16}
          className="animate-pulse text-rose-400"
        />
      ) : (
        <Target
          size={15}
          className={
            weeklyWarningLevel === "WARNING"
              ? "text-amber-400"
              : weeklyWarningLevel === "COMPLETED"
                ? "text-emerald-400"
                : "text-blue-400"
          }
        />
      )}
    </div>

    <div className="min-w-0 flex-1">

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p
          className={`text-[9px] font-semibold uppercase tracking-[0.18em] ${
            weeklyWarningLevel === "STRICT"
              ? "text-rose-400"
              : weeklyWarningLevel === "WARNING"
                ? "text-amber-400"
                : weeklyWarningLevel === "COMPLETED"
                  ? "text-emerald-400"
                  : "text-slate-600"
          }`}
        >
          {weeklyWarningLevel === "STRICT"
            ? "Action required"
            : weeklyWarningLevel === "WARNING"
              ? "Weekly target warning"
              : weeklyWarningLevel === "COMPLETED"
                ? "Weekly target completed"
                : "Weekly motivation"}
        </p>

        {weeklyWarningLevel !== "COMPLETED" && (
          <span className="font-mono text-[10px] text-slate-500">
            {formatTime(liveWeeklyRemainingSeconds)} left
          </span>
        )}
      </div>

      <p className="mt-2 text-xs leading-5 text-slate-300">
        {weeklyWarningMessage}
      </p>

      {weeklyWarningLevel === "STRICT" && (
        <p className="mt-2 text-[10px] font-medium text-rose-300/80">
          {workingDaysRemaining} working day remaining — plan your remaining
          hours carefully.
        </p>
      )}

      {weeklyWarningLevel === "WARNING" && (
        <p className="mt-2 text-[10px] text-amber-300/70">
          {workingDaysRemaining} working days remaining.
        </p>
      )}

      {weeklyWarningLevel === "COMPLETED" && (
        <p className="mt-2 text-[10px] text-emerald-300/70">
          You have reached the full 35-hour weekly target.
        </p>
      )}
    </div>
  </div>
</div>
     {/* Controls */}
<div className="mt-5 flex flex-wrap items-center justify-between gap-3">
  <div>
    <p className="text-[10px] text-slate-700">
      Work session is managed automatically.
    </p>

    <p className="mt-1 text-[9px] text-slate-800">
      Login starts tracking · Logout ends tracking
    </p>
  </div>

  <div className="flex flex-wrap gap-2">
    {workSession?.active ? (
      <button
        type="button"
        disabled={workActionLoading}
        onClick={async () => {
          try {
            setWorkActionLoading(true);

            await pauseWorkSession();

            const data = await getWorkSessionStatus();

            setWorkSession(data);
            setLiveSessionSeconds(
              data.activeSessionSeconds || 0
            );
            setLiveWeeklyRemainingSeconds(
              data.weeklyRemainingSeconds || 0
            );
          } catch (error) {
            console.error("Pause session error:", error);
          } finally {
            setWorkActionLoading(false);
          }
        }}
        className="inline-flex items-center gap-2 rounded-xl border border-amber-400/[0.15] bg-amber-400/[0.05] px-4 py-2.5 text-sm font-medium text-amber-300 transition hover:bg-amber-400/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Circle size={14} />
        Pause
      </button>
    ) : (
      <button
        type="button"
        disabled={workActionLoading}
        onClick={async () => {
          try {
            setWorkActionLoading(true);

            await resumeWorkSession();

            const data = await getWorkSessionStatus();

            setWorkSession(data);
            setLiveSessionSeconds(
              data.activeSessionSeconds || 0
            );
            setLiveWeeklyRemainingSeconds(
              data.weeklyRemainingSeconds || 0
            );
          } catch (error) {
            console.error("Resume session error:", error);
          } finally {
            setWorkActionLoading(false);
          }
        }}
        className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RefreshCw size={15} />
        Resume
      </button>
    )}
  </div>  
</div>
    </div>
  </div>
</section>
          <div className="group rounded-2xl border border-white/[0.07] bg-[#0c111a]/90 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-blue-400/15">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/[0.07]">
                <FolderKanban
                  size={18}
                  className="text-blue-400"
                />
              </div>

              <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                PROJECTS
              </span>
            </div>

            <p className="mt-5 text-3xl font-semibold text-white">
              {totalProjects}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Total projects
            </p>

            <button
              type="button"
              onClick={() => navigate("/projects")}
              className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-medium text-blue-400 transition hover:text-blue-300"
            >
              Open workspace
              <ArrowUpRight size={12} />
            </button>
          </div>

          <div className="group rounded-2xl border border-white/[0.07] bg-[#0c111a]/90 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-white/[0.12]">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.035]">
                <ListTodo
                  size={18}
                  className="text-slate-400"
                />
              </div>

              <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                TASKS
              </span>
            </div>

            <p className="mt-5 text-3xl font-semibold text-white">
              {totalTasks}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Total tasks
            </p>

            <div className="mt-4 text-[11px] text-slate-600">
              {todoTasks} waiting to start
            </div>
          </div>

          <div className="group rounded-2xl border border-white/[0.07] bg-[#0c111a]/90 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-blue-400/15">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/[0.07]">
                <Clock3
                  size={18}
                  className="text-blue-400"
                />
              </div>

              <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-blue-400/60">
                ACTIVE
              </span>
            </div>

            <p className="mt-5 text-3xl font-semibold text-white">
              {inProgressTasks}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Tasks in progress
            </p>

            <div className="mt-4 text-[11px] text-slate-600">
              {activeRate}% of total workload
            </div>
          </div>

          <div className="group rounded-2xl border border-white/[0.07] bg-[#0c111a]/90 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-emerald-400/15">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/[0.07]">
                <CheckCircle2
                  size={18}
                  className="text-emerald-400"
                />
              </div>

              <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald-400/70">
                DONE
              </span>
            </div>

            <p className="mt-5 text-3xl font-semibold text-white">
              {completedTasks}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Completed tasks
            </p>

            <div className="mt-4 text-[11px] text-emerald-400">
              {completionRate}% completion rate
            </div>
          </div>
        </section>

        {/* =========================================================
            EXECUTION + WORKLOAD
        ========================================================= */}
        <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">

          {/* Execution */}
          <div className="rounded-3xl border border-white/[0.07] bg-[#0c111a]/90 p-6 sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-blue-400">
                  Execution
                </p>

                <h2 className="mt-2 text-lg font-semibold text-white">
                  Workflow state
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                  Current distribution of work across the pipeline.
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[10px] text-slate-600">
                {totalTasks} total tasks
              </div>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[230px_1fr] lg:items-center">
              {/* Donut */}
              <div className="flex justify-center">
                <div
                  className="relative flex h-52 w-52 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(
                      #34d399 0 ${completedPercentage}%,
                      #3b82f6 ${completedPercentage}% ${
                        completedPercentage +
                        progressPercentage
                      }%,
                      #64748b ${
                        completedPercentage +
                        progressPercentage
                      }% 100%
                    )`,
                  }}
                >
                  <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full bg-[#0c111a]">
                    <span className="text-4xl font-semibold tracking-tight text-white">
                      {completionRate}%
                    </span>

                    <span className="mt-1 text-[9px] uppercase tracking-[0.18em] text-slate-700">
                      completion
                    </span>
                  </div>
                </div>
              </div>

              {/* State list */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />

                      <span className="text-sm font-medium text-slate-300">
                        To do
                      </span>
                    </div>

                    <div>
                      <span className="text-sm font-semibold text-white">
                        {todoTasks}
                      </span>

                      <span className="ml-2 text-[10px] text-slate-600">
                        {todoPercentage}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className="h-full rounded-full bg-slate-400 transition-all duration-700"
                      style={{
                        width: `${todoPercentage}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-400/[0.07] bg-blue-400/[0.02] p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />

                      <span className="text-sm font-medium text-slate-300">
                        In progress
                      </span>
                    </div>

                    <div>
                      <span className="text-sm font-semibold text-white">
                        {inProgressTasks}
                      </span>

                      <span className="ml-2 text-[10px] text-slate-600">
                        {progressPercentage}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className="h-full rounded-full bg-blue-400 transition-all duration-700"
                      style={{
                        width: `${progressPercentage}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-400/[0.07] bg-emerald-400/[0.018] p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

                      <span className="text-sm font-medium text-slate-300">
                        Completed
                      </span>
                    </div>

                    <div>
                      <span className="text-sm font-semibold text-white">
                        {completedTasks}
                      </span>

                      <span className="ml-2 text-[10px] text-slate-600">
                        {completedPercentage}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className="h-full rounded-full bg-emerald-400 transition-all duration-700"
                      style={{
                        width: `${completedPercentage}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pipeline */}
            <div className="mt-7 border-t border-white/[0.06] pt-5">
              <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.16em] text-slate-700">
                <span>Pipeline</span>
                <span>{completionRate}% complete</span>
              </div>

              <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-white/[0.04]">
                <div
                  className="bg-slate-500 transition-all duration-700"
                  style={{
                    width: `${todoPercentage}%`,
                  }}
                />

                <div
                  className="bg-blue-400 transition-all duration-700"
                  style={{
                    width: `${progressPercentage}%`,
                  }}
                />

                <div
                  className="bg-emerald-400 transition-all duration-700"
                  style={{
                    width: `${completedPercentage}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Workload */}
          <div className="rounded-3xl border border-white/[0.07] bg-[#0c111a]/90 p-6 sm:p-7">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-blue-400">
              Workload
            </p>

            <h2 className="mt-2 text-lg font-semibold text-white">
              Priority signals
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-600">
              Where attention is currently concentrated.
            </p>

            <div className="mt-7 space-y-5">
              {/* Low */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />

                    <span className="text-xs text-slate-400">
                      Low
                    </span>
                  </div>

                  <span className="text-xs font-medium text-white">
                    {lowPriorityTasks}
                  </span>
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{
                      width: `${lowPercentage}%`,
                    }}
                  />
                </div>
              </div>

              {/* Medium */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />

                    <span className="text-xs text-slate-400">
                      Medium
                    </span>
                  </div>

                  <span className="text-xs font-medium text-white">
                    {mediumPriorityTasks}
                  </span>
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className="h-full rounded-full bg-amber-400"
                    style={{
                      width: `${mediumPercentage}%`,
                    }}
                  />
                </div>
              </div>

              {/* High */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-rose-400" />

                    <span className="text-xs text-slate-400">
                      High
                    </span>
                  </div>

                  <span className="text-xs font-medium text-white">
                    {highPriorityTasks}
                  </span>
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className="h-full rounded-full bg-rose-400"
                    style={{
                      width: `${highPercentage}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Focus card */}
            <div className="mt-7 rounded-2xl border border-white/[0.06] bg-[#080b12] p-4">
              <div className="flex items-center gap-2">
                <Target
                  size={14}
                  className={focusSignalClass}
                />

                <span className="text-[9px] uppercase tracking-[0.16em] text-slate-700">
                  Focus signal
                </span>
              </div>

              <p
                className={`mt-3 text-sm font-semibold ${focusSignalClass}`}
              >
                {highPriorityTasks > 0
                  ? `${highPriorityTasks} high-priority ${
                      highPriorityTasks === 1
                        ? "task needs"
                        : "tasks need"
                    } attention`
                  : inProgressTasks > 0
                    ? `${inProgressTasks} ${
                        inProgressTasks === 1
                          ? "task is"
                          : "tasks are"
                      } currently active`
                    : "Workspace is ready for execution"}
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================
            QUICK ACTIONS
        ========================================================= */}
        <section className="mt-5 grid gap-4 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="group rounded-2xl border border-white/[0.07] bg-[#0c111a]/90 p-5 text-left transition duration-300 hover:-translate-y-0.5 hover:border-blue-400/15"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/[0.07]">
                <FolderKanban
                  size={17}
                  className="text-blue-400"
                />
              </div>

              <ArrowUpRight
                size={15}
                className="text-slate-700 transition group-hover:text-blue-400"
              />
            </div>

            <p className="mt-5 text-sm font-medium text-white">
              Manage projects
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-600">
              Create projects, update details and open
              project workspaces.
            </p>
          </button>

          <button
            type="button"
            onClick={() => navigate("/tasks")}
            className="group rounded-2xl border border-white/[0.07] bg-[#0c111a]/90 p-5 text-left transition duration-300 hover:-translate-y-0.5 hover:border-cyan-400/15"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/[0.07]">
                <ListTodo
                  size={17}
                  className="text-cyan-400"
                />
              </div>

              <ArrowUpRight
                size={15}
                className="text-slate-700 transition group-hover:text-cyan-400"
              />
            </div>

            <p className="mt-5 text-sm font-medium text-white">
              Work through tasks
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-600">
              Search, filter, update status and keep
              execution moving.
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/notifications")
            }
            className="group rounded-2xl border border-white/[0.07] bg-[#0c111a]/90 p-5 text-left transition duration-300 hover:-translate-y-0.5 hover:border-emerald-400/15"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/[0.07]">
                <Bell
                  size={17}
                  className="text-emerald-400"
                />
              </div>

              <ArrowUpRight
                size={15}
                className="text-slate-700 transition group-hover:text-emerald-400"
              />
            </div>

            <p className="mt-5 text-sm font-medium text-white">
              Review activity
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-600">
              Check assignments, updates and workspace
              notifications.
            </p>
          </button>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;