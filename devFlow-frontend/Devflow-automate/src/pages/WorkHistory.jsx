import { useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  History,
  Loader2,
  TrendingUp,
} from "lucide-react";

import {
  getSessionHistoryForWeek,
  getWeeklyWorkHistory,
} from "../services/workHistoryService";

const formatTime = (seconds) => {
  const totalSeconds = Math.max(
    Number(seconds) || 0,
    0
  );

  const hours = Math.floor(
    totalSeconds / 3600
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const secs = totalSeconds % 60;

  return `${String(hours).padStart(
    2,
    "0"
  )}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(secs).padStart(2, "0")}`;
};

const formatDate = (dateString) => {
  return new Date(
    `${dateString}T00:00:00`
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDay = (dateString) => {
  return new Date(
    `${dateString}T00:00:00`
  ).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });
};

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) {
    return "--";
  }

  return new Date(
    dateTimeString
  ).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusLabel = (status) => {
  switch (status) {
    case "ACTIVE":
      return "Active";

    case "PAUSED":
      return "Paused";

    case "COMPLETED":
      return "Completed";

    default:
      return status || "Unknown";
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case "ACTIVE":
      return "border-blue-400/10 bg-blue-400/[0.05] text-blue-300";

    case "PAUSED":
      return "border-amber-400/10 bg-amber-400/[0.05] text-amber-300";

    case "COMPLETED":
      return "border-emerald-400/10 bg-emerald-400/[0.05] text-emerald-300";

    default:
      return "border-white/[0.06] bg-white/[0.02] text-slate-500";
  }
};

function WorkHistory() {
  const [weeks, setWeeks] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [expandedWeeks, setExpandedWeeks] =
    useState({});

  const [sessionData, setSessionData] =
    useState({});

  const [sessionLoading, setSessionLoading] =
    useState({});

  const loadHistory = async () => {
    try {
      setError("");

      const data =
        await getWeeklyWorkHistory();

      setWeeks(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load work history:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load work history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initialLoad = async () => {
      try {
        setError("");

        const data =
          await getWeeklyWorkHistory();

        if (mounted) {
          setWeeks(
            Array.isArray(data)
              ? data
              : []
          );
        }
      } catch (err) {
        console.error(
          "Failed to load work history:",
          err
        );

        if (mounted) {
          setError(
            err?.response?.data?.message ||
              "Unable to load work history."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initialLoad();

    const interval = setInterval(
      initialLoad,
      30000
    );

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const currentWeek = weeks[0];

  const previousWeeks =
    weeks.slice(1);

  const groupedSessions = (sessions) => {
    const groups = {};

    for (const session of sessions || []) {
      const date =
        session.date ||
        session.startedAt?.slice(0, 10);

      if (!date) {
        continue;
      }

      if (!groups[date]) {
        groups[date] = [];
      }

      groups[date].push(session);
    }

    return Object.entries(groups)
      .sort(
        ([dateA], [dateB]) =>
          dateA.localeCompare(dateB)
      );
  };

  const toggleWeek = async (week) => {
    const weekStart = week.weekStart;

    const isExpanded =
      Boolean(
        expandedWeeks[weekStart]
      );

    setExpandedWeeks((current) => ({
      ...current,
      [weekStart]: !isExpanded,
    }));

    if (
      isExpanded ||
      sessionData[weekStart]
    ) {
      return;
    }

    try {
      setSessionLoading((current) => ({
        ...current,
        [weekStart]: true,
      }));

      const data =
        await getSessionHistoryForWeek(
          weekStart
        );

      setSessionData((current) => ({
        ...current,
        [weekStart]: Array.isArray(data)
          ? data
          : [],
      }));
    } catch (err) {
      console.error(
        "Failed to load session history:",
        err
      );

      setSessionData((current) => ({
        ...current,
        [weekStart]: [],
      }));
    } finally {
      setSessionLoading((current) => ({
        ...current,
        [weekStart]: false,
      }));
    }
  };

  const currentWeekSessionGroups =
    useMemo(() => {
      if (!currentWeek) {
        return [];
      }

      return groupedSessions(
        sessionData[currentWeek.weekStart]
      );
    }, [
      currentWeek,
      sessionData,
    ]);

  return (
    <div className="min-h-full bg-[#080b12] px-4 py-6 text-slate-200 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2">
              <History
                size={16}
                className="text-blue-400"
              />

              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Employee Workspace
              </span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Work History
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Review your weekly work hours,
              progress, and individual sessions.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-xs text-slate-500">
            <CalendarDays size={14} />
            <span>Weekly records</span>
          </div>

        </div>

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Loader2
                size={18}
                className="animate-spin"
              />
              Loading work history...
            </div>
          </div>
        )}

        {/* =====================================================
            ERROR
        ===================================================== */}

        {!loading && error && (
          <div className="rounded-2xl border border-red-400/10 bg-red-500/[0.04] p-5 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* =====================================================
            CONTENT
        ===================================================== */}

        {!loading &&
          !error &&
          weeks.length > 0 && (
            <div className="space-y-8">

              {/* =================================================
                  CURRENT WEEK
              ================================================= */}

              {currentWeek && (
                <section>

                  <div className="mb-4 flex items-center gap-2">
                    <TrendingUp
                      size={15}
                      className="text-blue-400"
                    />

                    <h2 className="text-sm font-semibold text-slate-300">
                      Current Week
                    </h2>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-blue-400/10 bg-white/[0.025] shadow-[0_20px_60px_rgba(0,0,0,0.18)]">

                    {/* Week summary */}

                    <div className="p-5 sm:p-6">

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                          <p className="text-lg font-semibold text-white">
                            {formatDate(
                              currentWeek.weekStart
                            )}
                            {" → "}
                            {formatDate(
                              currentWeek.weekEnd
                            )}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Monday – Sunday
                          </p>
                        </div>

                        {currentWeek.completed ? (
                          <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/[0.06] px-3 py-1.5 text-xs font-medium text-emerald-300">
                            <CheckCircle2 size={14} />
                            Completed
                          </div>
                        ) : (
                          <div className="flex w-fit items-center gap-2 rounded-full border border-blue-400/10 bg-blue-400/[0.05] px-3 py-1.5 text-xs font-medium text-blue-300">
                            <Clock3 size={14} />
                            In Progress
                          </div>
                        )}

                      </div>

                      <div className="mt-6 grid gap-3 sm:grid-cols-3">

                        <div className="rounded-xl border border-white/[0.06] bg-black/10 p-4">
                          <p className="text-[10px] uppercase tracking-[0.16em] text-slate-600">
                            Target
                          </p>

                          <p className="mt-2 text-xl font-semibold text-white">
                            {formatTime(
                              currentWeek.targetSeconds
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/[0.06] bg-black/10 p-4">
                          <p className="text-[10px] uppercase tracking-[0.16em] text-slate-600">
                            Worked
                          </p>

                          <p className="mt-2 text-xl font-semibold text-white">
                            {formatTime(
                              currentWeek.workedSeconds
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/[0.06] bg-black/10 p-4">
                          <p className="text-[10px] uppercase tracking-[0.16em] text-slate-600">
                            Remaining
                          </p>

                          <p className="mt-2 text-xl font-semibold text-white">
                            {formatTime(
                              currentWeek.remainingSeconds
                            )}
                          </p>
                        </div>

                      </div>

                      {/* Progress */}

                      <div className="mt-6">

                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="text-slate-500">
                            Weekly progress
                          </span>

                          <span className="font-medium text-slate-300">
                            {Number(
                              currentWeek.progressPercentage ||
                                0
                            ).toFixed(1)}
                            %
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all duration-500"
                            style={{
                              width: `${Math.min(
                                Number(
                                  currentWeek.progressPercentage
                                ) || 0,
                                100
                              )}%`,
                            }}
                          />
                        </div>

                      </div>

                      {/* Expand button */}

                      <button
                        type="button"
                        onClick={() =>
                          toggleWeek(currentWeek)
                        }
                        className="mt-6 flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-left transition hover:border-blue-400/10 hover:bg-white/[0.035]"
                      >

                        <span className="flex items-center gap-2 text-xs font-medium text-slate-300">
                          {expandedWeeks[
                            currentWeek.weekStart
                          ] ? (
                            <ChevronDown size={15} />
                          ) : (
                            <ChevronRight size={15} />
                          )}

                          View sessions
                        </span>

                        {sessionLoading[
                          currentWeek.weekStart
                        ] && (
                          <Loader2
                            size={14}
                            className="animate-spin text-slate-500"
                          />
                        )}

                      </button>

                    </div>

                    {/* Current week sessions */}

                    {expandedWeeks[
                      currentWeek.weekStart
                    ] && (
                      <div className="border-t border-white/[0.06] bg-black/10 p-5 sm:p-6">

                        {sessionLoading[
                          currentWeek.weekStart
                        ] ? (
                          <div className="flex items-center justify-center py-8 text-sm text-slate-500">
                            <Loader2
                              size={17}
                              className="mr-2 animate-spin"
                            />
                            Loading sessions...
                          </div>
                        ) : currentWeekSessionGroups.length ===
                          0 ? (
                          <p className="py-8 text-center text-sm text-slate-600">
                            No sessions recorded for this week.
                          </p>
                        ) : (
                          <div className="space-y-6">

                            {currentWeekSessionGroups.map(
                              ([date, sessions]) => (
                                <div
                                  key={date}
                                >

                                  <div className="mb-3 flex items-center gap-2">
                                    <CalendarDays
                                      size={14}
                                      className="text-slate-500"
                                    />

                                    <h3 className="text-xs font-semibold text-slate-300">
                                      {formatDay(date)}
                                    </h3>
                                  </div>

                                  <div className="space-y-2">

                                    {sessions.map(
                                      (
                                        session
                                      ) => (
                                        <div
                                          key={
                                            session.id
                                          }
                                          className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4"
                                        >

                                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">

                                              <div>
                                                <p className="text-[9px] uppercase tracking-[0.14em] text-slate-600">
                                                  Started
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-slate-200">
                                                  {formatDateTime(
                                                    session.startedAt
                                                  )}
                                                </p>
                                              </div>

                                              <div>
                                                <p className="text-[9px] uppercase tracking-[0.14em] text-slate-600">
                                                  Ended
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-slate-200">
                                                  {formatDateTime(
                                                    session.endedAt
                                                  )}
                                                </p>
                                              </div>

                                              <div>
                                                <p className="text-[9px] uppercase tracking-[0.14em] text-slate-600">
                                                  Duration
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-slate-200">
                                                  {formatTime(
                                                    session.durationSeconds
                                                  )}
                                                </p>
                                              </div>

                                            </div>

                                            <span
                                              className={`flex w-fit items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getStatusClass(
                                                session.status
                                              )}`}
                                            >
                                              {getStatusLabel(
                                                session.status
                                              )}
                                            </span>

                                          </div>

                                        </div>
                                      )
                                    )}

                                  </div>

                                </div>
                              )
                            )}

                          </div>
                        )}

                      </div>
                    )}

                  </div>
                </section>
              )}

              {/* =================================================
                  PREVIOUS WEEKS
              ================================================= */}

              <section>

                <div className="mb-4 flex items-center gap-2">
                  <History
                    size={15}
                    className="text-slate-400"
                  />

                  <h2 className="text-sm font-semibold text-slate-300">
                    Previous Weeks
                  </h2>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">

                  <div className="hidden grid-cols-[1.5fr_1fr_1fr_1fr_120px_120px] gap-4 border-b border-white/[0.06] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600 md:grid">
                    <span>Week</span>
                    <span>Target</span>
                    <span>Worked</span>
                    <span>Remaining</span>
                    <span>Status</span>
                    <span>Sessions</span>
                  </div>

                  {previousWeeks.map(
                    (week, index) => {
                      const isExpanded =
                        Boolean(
                          expandedWeeks[
                            week.weekStart
                          ]
                        );

                      const groups =
                        groupedSessions(
                          sessionData[
                            week.weekStart
                          ]
                        );

                      return (
                        <div
                          key={`${week.weekStart}-${index}`}
                          className="border-b border-white/[0.05] last:border-b-0"
                        >

                          {/* Desktop */}

                          <div className="hidden px-5 py-4 md:block">

                            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_120px_120px] items-center gap-4">

                              <div>
                                <p className="text-sm font-medium text-slate-200">
                                  {formatDate(
                                    week.weekStart
                                  )}
                                </p>

                                <p className="mt-1 text-xs text-slate-600">
                                  {formatDate(
                                    week.weekEnd
                                  )}
                                </p>
                              </div>

                              <span className="text-sm text-slate-400">
                                {formatTime(
                                  week.targetSeconds
                                )}
                              </span>

                              <span className="text-sm font-medium text-slate-200">
                                {formatTime(
                                  week.workedSeconds
                                )}
                              </span>

                              <span className="text-sm text-slate-400">
                                {formatTime(
                                  week.remainingSeconds
                                )}
                              </span>

                              {week.completed ? (
                                <span className="flex w-fit items-center gap-1.5 rounded-full border border-emerald-400/10 bg-emerald-400/[0.05] px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
                                  <CheckCircle2 size={12} />
                                  Completed
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium text-slate-500">
                                  Not completed
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  toggleWeek(
                                    week
                                  )
                                }
                                className="flex w-fit items-center gap-1.5 text-[10px] font-medium text-slate-400 transition hover:text-blue-400"
                              >
                                {isExpanded ? (
                                  <ChevronDown
                                    size={13}
                                  />
                                ) : (
                                  <ChevronRight
                                    size={13}
                                  />
                                )}

                                {isExpanded
                                  ? "Hide"
                                  : "View"}
                              </button>

                            </div>

                            {/* Expanded sessions */}

                            {isExpanded && (
                              <div className="mt-5 border-t border-white/[0.05] pt-5">

                                {sessionLoading[
                                  week.weekStart
                                ] ? (
                                  <div className="flex items-center justify-center py-6 text-sm text-slate-600">
                                    <Loader2
                                      size={16}
                                      className="mr-2 animate-spin"
                                    />
                                    Loading sessions...
                                  </div>
                                ) : groups.length ===
                                  0 ? (
                                  <p className="py-6 text-center text-sm text-slate-600">
                                    No sessions recorded for this week.
                                  </p>
                                ) : (
                                  <div className="space-y-5">

                                    {groups.map(
                                      ([date, sessions]) => (
                                        <div
                                          key={date}
                                        >

                                          <p className="mb-2 text-xs font-semibold text-slate-400">
                                            {formatDay(
                                              date
                                            )}
                                          </p>

                                          <div className="space-y-2">

                                            {sessions.map(
                                              (
                                                session
                                              ) => (
                                                <div
                                                  key={
                                                    session.id
                                                  }
                                                  className="rounded-xl border border-white/[0.05] bg-black/10 p-4"
                                                >

                                                  <div className="flex flex-wrap items-center justify-between gap-3">

                                                    <div className="flex flex-wrap items-center gap-5">

                                                      <div>
                                                        <p className="text-[9px] uppercase tracking-[0.14em] text-slate-600">
                                                          Started
                                                        </p>

                                                        <p className="mt-1 text-sm text-slate-200">
                                                          {formatDateTime(
                                                            session.startedAt
                                                          )}
                                                        </p>
                                                      </div>

                                                      <div>
                                                        <p className="text-[9px] uppercase tracking-[0.14em] text-slate-600">
                                                          Ended
                                                        </p>

                                                        <p className="mt-1 text-sm text-slate-200">
                                                          {formatDateTime(
                                                            session.endedAt
                                                          )}
                                                        </p>
                                                      </div>

                                                      <div>
                                                        <p className="text-[9px] uppercase tracking-[0.14em] text-slate-600">
                                                          Duration
                                                        </p>

                                                        <p className="mt-1 text-sm text-slate-200">
                                                          {formatTime(
                                                            session.durationSeconds
                                                          )}
                                                        </p>
                                                      </div>

                                                    </div>

                                                    <span
                                                      className={`flex w-fit items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getStatusClass(
                                                        session.status
                                                      )}`}
                                                    >
                                                      {getStatusLabel(
                                                        session.status
                                                      )}
                                                    </span>

                                                  </div>

                                                </div>
                                              )
                                            )}

                                          </div>

                                        </div>
                                      )
                                    )}

                                  </div>
                                )}

                              </div>
                            )}

                          </div>

                          {/* Mobile */}

                          <div className="p-4 md:hidden">

                            <div className="flex items-start justify-between gap-4">

                              <div>
                                <p className="text-sm font-medium text-slate-200">
                                  {formatDate(
                                    week.weekStart
                                  )}
                                </p>

                                <p className="mt-1 text-xs text-slate-600">
                                  {formatDate(
                                    week.weekEnd
                                  )}
                                </p>
                              </div>

                              {week.completed ? (
                                <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/10 bg-emerald-400/[0.05] px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
                                  <CheckCircle2 size={12} />
                                  Completed
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500">
                                  Not completed
                                </span>
                              )}

                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-2">

                              <div className="rounded-lg bg-black/10 p-3">
                                <p className="text-[9px] uppercase tracking-[0.14em] text-slate-600">
                                  Target
                                </p>

                                <p className="mt-1 text-xs font-medium text-slate-300">
                                  {formatTime(
                                    week.targetSeconds
                                  )}
                                </p>
                              </div>

                              <div className="rounded-lg bg-black/10 p-3">
                                <p className="text-[9px] uppercase tracking-[0.14em] text-slate-600">
                                  Worked
                                </p>

                                <p className="mt-1 text-xs font-medium text-slate-300">
                                  {formatTime(
                                    week.workedSeconds
                                  )}
                                </p>
                              </div>

                              <div className="rounded-lg bg-black/10 p-3">
                                <p className="text-[9px] uppercase tracking-[0.14em] text-slate-600">
                                  Remaining
                                </p>

                                <p className="mt-1 text-xs font-medium text-slate-300">
                                  {formatTime(
                                    week.remainingSeconds
                                  )}
                                </p>
                              </div>

                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                toggleWeek(
                                  week
                                )
                              }
                              className="mt-4 flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-left text-xs font-medium text-slate-300"
                            >
                              <span className="flex items-center gap-2">

                                {isExpanded ? (
                                  <ChevronDown
                                    size={14}
                                  />
                                ) : (
                                  <ChevronRight
                                    size={14}
                                  />
                                )}

                                {isExpanded
                                  ? "Hide sessions"
                                  : "View sessions"}

                              </span>

                              {sessionLoading[
                                week.weekStart
                              ] && (
                                <Loader2
                                  size={14}
                                  className="animate-spin text-slate-500"
                                />
                              )}

                            </button>

                            {isExpanded && (
                              <div className="mt-4 border-t border-white/[0.05] pt-4">

                                {sessionLoading[
                                  week.weekStart
                                ] ? (
                                  <div className="flex items-center justify-center py-6 text-sm text-slate-600">
                                    <Loader2
                                      size={16}
                                      className="mr-2 animate-spin"
                                    />
                                    Loading sessions...
                                  </div>
                                ) : groups.length ===
                                  0 ? (
                                  <p className="py-6 text-center text-sm text-slate-600">
                                    No sessions recorded for this week.
                                  </p>
                                ) : (
                                  <div className="space-y-5">

                                    {groups.map(
                                      ([date, sessions]) => (
                                        <div
                                          key={date}
                                        >

                                          <p className="mb-2 text-xs font-semibold text-slate-400">
                                            {formatDay(
                                              date
                                            )}
                                          </p>

                                          <div className="space-y-2">

                                            {sessions.map(
                                              (
                                                session
                                              ) => (
                                                <div
                                                  key={
                                                    session.id
                                                  }
                                                  className="rounded-xl border border-white/[0.05] bg-black/10 p-3"
                                                >

                                                  <div className="flex items-center justify-between gap-3">

                                                    <div>
                                                      <p className="text-sm font-medium text-slate-200">
                                                        {formatDateTime(
                                                          session.startedAt
                                                        )}
                                                        {" → "}
                                                        {formatDateTime(
                                                          session.endedAt
                                                        )}
                                                      </p>

                                                      <p className="mt-1 text-xs text-slate-500">
                                                        {formatTime(
                                                          session.durationSeconds
                                                        )}
                                                      </p>
                                                    </div>

                                                    <span
                                                      className={`flex w-fit items-center rounded-full border px-2 py-1 text-[9px] font-semibold ${getStatusClass(
                                                        session.status
                                                      )}`}
                                                    >
                                                      {getStatusLabel(
                                                        session.status
                                                      )}
                                                    </span>

                                                  </div>

                                                </div>
                                              )
                                            )}

                                          </div>

                                        </div>
                                      )
                                    )}

                                  </div>
                                )}

                              </div>
                            )}

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              </section>

            </div>
          )}

        {/* =====================================================
            EMPTY
        ===================================================== */}

        {!loading &&
          !error &&
          weeks.length === 0 && (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 text-center">

              <History
                size={24}
                className="mx-auto text-slate-600"
              />

              <p className="mt-3 text-sm text-slate-400">
                No work history available yet.
              </p>

            </div>
          )}

      </div>
    </div>
  );
}

export default WorkHistory;