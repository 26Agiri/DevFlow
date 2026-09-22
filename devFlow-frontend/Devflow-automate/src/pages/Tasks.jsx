import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock3,
  Layers3,
  ListFilter,
  ListTodo,
  Plus,
  Search,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Tasks() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [tasks, setTasks] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
    assignedTo: "",
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setError("");

        const response = await api.get("/projects");

        setProjects(response.data);

        if (response.data.length > 0) {
          setSelectedProject(String(response.data[0].id));
        }
      } catch (error) {
        console.error("Projects error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load projects."
        );
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    if (!selectedProject) {
      setTasks([]);
      return;
    }

    const fetchTasks = async () => {
      try {
        setLoadingTasks(true);
        setError("");

        const response = await api.get(
          `/projects/${selectedProject}/tasks`
        );

        setTasks(response.data);
      } catch (error) {
        console.error("Tasks error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load tasks."
        );
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [selectedProject]);

  const selectedProjectData = projects.find(
    (project) =>
      String(project.id) === String(selectedProject)
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!selectedProject) {
      setFormError("Please select a project first.");
      return;
    }

    if (!formData.title.trim()) {
      setFormError("Task title is required.");
      return;
    }

    try {
      setFormError("");
      setCreating(true);

      const response = await api.post(
        `/projects/${selectedProject}/tasks`,
        {
          title: formData.title.trim(),
          description: formData.description.trim(),
          priority: formData.priority,
          dueDate: formData.dueDate || null,
          assignedTo: formData.assignedTo.trim() || null,
        }
      );

      setTasks((current) => [
        response.data,
        ...current,
      ]);

      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error("Create task error:", error);

      setFormError(
        error.response?.data?.message ||
          "Unable to create task."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    if (!selectedProject || !taskId || !newStatus) {
      return;
    }

    try {
      setError("");
      setUpdatingTaskId(taskId);

      const response = await api.put(
        `/projects/${selectedProject}/tasks/${taskId}/status`,
        {
          status: newStatus,
        }
      );

      setTasks((current) =>
        current.map((task) =>
          task.id === taskId
            ? {
                ...task,
                ...response.data,
                status:
                  response.data?.status || newStatus,
              }
            : task
        )
      );
    } catch (error) {
      console.error("Status update error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to update task status."
      );
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "MEDIUM",
      dueDate: "",
      assignedTo: "",
    });

    setFormError("");
  };

  const closeModal = () => {
    if (creating) {
      return;
    }

    setShowModal(false);
    resetForm();
  };

  const getStatusIcon = (status) => {
    if (status === "DONE") {
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/[0.07]">
          <CheckCircle2
            size={17}
            className="text-emerald-400"
          />
        </div>
      );
    }

    if (status === "IN_PROGRESS") {
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-400/[0.07]">
          <Clock3
            size={17}
            className="text-blue-400"
          />
        </div>
      );
    }

    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.035]">
        <Circle
          size={17}
          className="text-slate-600"
        />
      </div>
    );
  };

  const getPriorityClass = (priority) => {
    if (priority === "HIGH") {
      return "border-rose-400/15 bg-rose-400/[0.06] text-rose-400";
    }

    if (priority === "MEDIUM") {
      return "border-amber-400/15 bg-amber-400/[0.05] text-amber-400";
    }

    return "border-white/[0.07] bg-white/[0.025] text-slate-500";
  };

  const getStatusClass = (status) => {
    if (status === "DONE") {
      return "border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-400";
    }

    if (status === "IN_PROGRESS") {
      return "border-blue-400/15 bg-blue-400/[0.06] text-blue-400";
    }

    return "border-white/[0.08] bg-white/[0.025] text-slate-500";
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        task.title?.toLowerCase().includes(searchText) ||
        task.description?.toLowerCase().includes(searchText) ||
        task.assignedToName
          ?.toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "ALL" ||
        task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" ||
        task.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    tasks,
    search,
    statusFilter,
    priorityFilter,
  ]);

  const todoCount = tasks.filter(
    (task) => task.status === "TODO"
  ).length;

  const inProgressCount = tasks.filter(
    (task) => task.status === "IN_PROGRESS"
  ).length;

  const doneCount = tasks.filter(
    (task) => task.status === "DONE"
  ).length;

  const highPriorityCount = tasks.filter(
    (task) => task.priority === "HIGH"
  ).length;

  const completionPercentage =
    tasks.length > 0
      ? Math.round((doneCount / tasks.length) * 100)
      : 0;

  if (loadingProjects) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#080b12]">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-blue-400" />

          <p className="mt-4 text-sm text-slate-500">
            Loading workspace...
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

        <div className="absolute right-0 top-52 h-96 w-96 rounded-full bg-cyan-400/[0.035] blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.022]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl p-5 sm:p-6 lg:p-8">
        {/* Header */}
        <section className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0c111a]/90 shadow-2xl shadow-black/20">
          <div className="relative p-6 sm:p-8">
            <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-blue-500/[0.06] blur-[90px]" />

            <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-blue-400">
                  <Sparkles size={13} />
                  Execution Workspace
                </div>

                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Tasks
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                  Turn project plans into trackable work
                  and keep execution moving.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFormError("");
                  setShowModal(true);
                }}
                disabled={!selectedProject}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-blue-500/10 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus size={16} />
                New Task
              </button>
            </div>
          </div>

          {/* Project selector */}
          <div className="border-t border-white/[0.06] bg-white/[0.012] px-6 py-5 sm:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/[0.07]">
                  <Layers3
                    size={16}
                    className="text-blue-400"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-slate-700">
                    Active Project
                  </p>

                  <p className="mt-0.5 truncate text-sm font-medium text-slate-200">
                    {selectedProjectData?.name ||
                      "Select a project"}
                  </p>
                </div>
              </div>

              <div className="relative w-full lg:w-72">
                <select
                  value={selectedProject}
                  onChange={(e) => {
                    setSelectedProject(
                      e.target.value
                    );
                    setSearch("");
                    setStatusFilter("ALL");
                    setPriorityFilter("ALL");
                  }}
                  className="w-full appearance-none rounded-xl border border-white/[0.08] bg-[#080b12] px-4 py-3 pr-10 text-sm text-slate-300 outline-none transition focus:border-blue-500/40"
                >
                  {projects.length === 0 ? (
                    <option value="">
                      No projects available
                    </option>
                  ) : (
                    projects.map((project) => (
                      <option
                        key={project.id}
                        value={project.id}
                        className="bg-[#0d121b]"
                      >
                        {project.name}
                      </option>
                    ))
                  )}
                </select>

                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-600"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-2xl border border-red-500/10 bg-red-500/[0.05] px-5 py-4 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Stats */}
        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/[0.07] bg-[#0c111a]/90 p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/[0.07]">
                <ListTodo
                  size={17}
                  className="text-blue-400"
                />
              </div>

              <span className="text-[10px] uppercase tracking-wider text-slate-700">
                Total
              </span>
            </div>

            <p className="mt-5 text-3xl font-semibold tracking-tight text-white">
              {tasks.length}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Tasks in project
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#0c111a]/90 p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.035]">
              <Circle
                size={17}
                className="text-slate-500"
              />
            </div>

            <p className="mt-5 text-3xl font-semibold tracking-tight text-white">
              {todoCount}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Waiting to start
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#0c111a]/90 p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/[0.07]">
              <Clock3
                size={17}
                className="text-blue-400"
              />
            </div>

            <p className="mt-5 text-3xl font-semibold tracking-tight text-white">
              {inProgressCount}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Currently active
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#0c111a]/90 p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/[0.07]">
                <CheckCircle2
                  size={17}
                  className="text-emerald-400"
                />
              </div>

              <span className="text-[10px] text-emerald-400">
                {completionPercentage}%
              </span>
            </div>

            <p className="mt-5 text-3xl font-semibold tracking-tight text-white">
              {doneCount}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Completed
            </p>
          </div>
        </section>

        {/* Main workspace */}
        <section className="mt-5 overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0c111a]/90">
          {/* Toolbar */}
          <div className="border-b border-white/[0.06] p-5 sm:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-white">
                    Task Board
                  </h2>

                  <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-500">
                    {filteredTasks.length}
                  </span>
                </div>

                <p className="mt-1.5 text-xs text-slate-600">
                  Showing {filteredTasks.length} of{" "}
                  {tasks.length} tasks
                </p>
              </div>

              <div className="flex flex-col gap-2 md:flex-row">
                <div className="relative md:min-w-64">
                  <Search
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search tasks..."
                    className="w-full rounded-xl border border-white/[0.07] bg-[#080b12] py-2.5 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-700 focus:border-blue-500/40"
                  />
                </div>

                <div className="relative">
                  <ListFilter
                    size={13}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                  />

                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-white/[0.07] bg-[#080b12] py-2.5 pl-8 pr-9 text-xs text-slate-400 outline-none focus:border-blue-500/40 md:w-40"
                  >
                    <option value="ALL">
                      All Status
                    </option>
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">
                      IN PROGRESS
                    </option>
                    <option value="DONE">DONE</option>
                  </select>

                  <ChevronDown
                    size={12}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-600"
                  />
                </div>

                <select
                  value={priorityFilter}
                  onChange={(e) =>
                    setPriorityFilter(e.target.value)
                  }
                  className="rounded-xl border border-white/[0.07] bg-[#080b12] px-3 py-2.5 text-xs text-slate-400 outline-none focus:border-blue-500/40 md:w-40"
                >
                  <option value="ALL">
                    All Priority
                  </option>
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>
            </div>

            {/* Small overview row */}
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.05] pt-4 text-[11px]">
              <span className="text-slate-600">
                <span className="font-medium text-slate-400">
                  {tasks.length}
                </span>{" "}
                total
              </span>

              <span className="text-slate-600">
                <span className="font-medium text-blue-400">
                  {inProgressCount}
                </span>{" "}
                active
              </span>

              <span className="text-slate-600">
                <span className="font-medium text-emerald-400">
                  {doneCount}
                </span>{" "}
                done
              </span>

              <span className="text-slate-600">
                <span className="font-medium text-rose-400">
                  {highPriorityCount}
                </span>{" "}
                high priority
              </span>
            </div>
          </div>

          {/* Task list */}
          <div className="p-4 sm:p-5">
            {loadingTasks ? (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.012] p-12 text-center">
                <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-blue-400" />

                <p className="mt-4 text-sm text-slate-600">
                  Loading tasks...
                </p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.012] p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025]">
                  <ListTodo
                    size={22}
                    className="text-slate-600"
                  />
                </div>

                <h2 className="mt-5 text-sm font-semibold text-white">
                  No tasks yet
                </h2>

                <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-600">
                  Create your first task for this
                  project and start tracking execution.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setFormError("");
                    setShowModal(true);
                  }}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-blue-400"
                >
                  <Plus size={14} />
                  Create Task
                </button>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.012] p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025]">
                  <Search
                    size={21}
                    className="text-slate-600"
                  />
                </div>

                <h2 className="mt-5 text-sm font-semibold text-white">
                  No matching tasks
                </h2>

                <p className="mt-2 text-xs text-slate-600">
                  Try changing your search or filters.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("ALL");
                    setPriorityFilter("ALL");
                  }}
                  className="mt-5 rounded-xl border border-white/[0.08] px-4 py-2.5 text-xs font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() =>
                      navigate(
                        `/projects/${selectedProject}/tasks/${task.id}`
                      )
                    }
                    className="group cursor-pointer rounded-2xl border border-white/[0.065] bg-white/[0.012] p-4 transition duration-200 hover:border-blue-400/15 hover:bg-white/[0.022] sm:p-5"
                  >
                    <div className="flex gap-4">
                      {/* Status icon */}
                      <div className="shrink-0">
                        {getStatusIcon(task.status)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          {/* Main content */}
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-semibold text-slate-200 transition group-hover:text-white">
                                {task.title}
                              </h3>

                              <span
                                className={`rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide ${getPriorityClass(
                                  task.priority
                                )}`}
                              >
                                {task.priority}
                              </span>
                            </div>

                            <p className="mt-2 line-clamp-2 max-w-3xl text-xs leading-5 text-slate-600">
                              {task.description ||
                                "No description provided."}
                            </p>
                          </div>

                          {/* Status */}
                          <div
                            className="shrink-0"
                            onClick={(e) =>
                              e.stopPropagation()
                            }
                          >
                            <div className="relative">
                              <select
                                value={task.status}
                                disabled={
                                  updatingTaskId ===
                                  task.id
                                }
                                onChange={(e) =>
                                  handleStatusChange(
                                    task.id,
                                    e.target.value
                                  )
                                }
                                className={`appearance-none rounded-xl border py-2 pl-3 pr-8 text-[10px] font-semibold outline-none transition disabled:cursor-not-allowed disabled:opacity-50 ${getStatusClass(
                                  task.status
                                )}`}
                              >
                                <option value="TODO">
                                  TODO
                                </option>

                                <option value="IN_PROGRESS">
                                  IN PROGRESS
                                </option>

                                <option value="DONE">
                                  DONE
                                </option>
                              </select>

                              <ChevronDown
                                size={11}
                                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-current"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/[0.05] pt-3">
                          {task.dueDate && (
                            <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-600">
                              <CalendarDays size={11} />
                              Due {task.dueDate}
                            </span>
                          )}

                          {task.assignedToName && (
                            <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-600">
                              <UserRound size={11} />
                              {task.assignedToName}
                            </span>
                          )}

                          <span className="text-[10px] text-slate-700">
                            Task #{task.id}
                          </span>

                          {updatingTaskId ===
                            task.id && (
                            <span className="text-[10px] text-blue-400">
                              Updating status...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/[0.09] bg-[#0d121b] shadow-2xl shadow-black/50">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-[#0d121b]/95 px-6 py-5 backdrop-blur">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/[0.09]">
                    <Plus
                      size={15}
                      className="text-blue-400"
                    />
                  </div>

                  <h2 className="text-base font-semibold text-white">
                    New Task
                  </h2>
                </div>

                <p className="mt-2 text-xs text-slate-600">
                  Add work to{" "}
                  {selectedProjectData?.name ||
                    "your project"}.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={creating}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
              >
                <X size={17} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleCreateTask}
              className="p-6"
            >
              {formError && (
                <div className="mb-5 rounded-xl border border-red-500/10 bg-red-500/[0.05] px-4 py-3 text-xs text-red-400">
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Task Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Build authentication flow"
                  maxLength={150}
                  required
                  autoFocus
                  className="w-full rounded-xl border border-white/[0.08] bg-[#080b12] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-700 focus:border-blue-500/50"
                />
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="What needs to be done?"
                  maxLength={2000}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-white/[0.08] bg-[#080b12] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-700 focus:border-blue-500/50"
                />
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/[0.08] bg-[#080b12] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">
                      MEDIUM
                    </option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Due Date
                  </label>

                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/[0.08] bg-[#080b12] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Assign To
                </label>

                <input
                  type="email"
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  placeholder="developer@example.com"
                  className="w-full rounded-xl border border-white/[0.08] bg-[#080b12] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-700 focus:border-blue-500/50"
                />

                <p className="mt-2 text-[11px] text-slate-700">
                  Enter a registered user's email.
                </p>
              </div>

              <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={creating}
                  className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/10 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating
                    ? "Creating..."
                    : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;