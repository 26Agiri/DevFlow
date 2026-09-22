import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Layers3,
  ListTodo,
  Plus,
  Search,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
    assignedTo: "",
  });

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        setError("");

        const [projectResponse, tasksResponse] = await Promise.all([
          api.get(`/projects/${projectId}`),
          api.get(`/projects/${projectId}/tasks`),
        ]);

        setProject(projectResponse.data);
        setTasks(tasksResponse.data);
      } catch (error) {
        console.error("Project details error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load project details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  const todoCount = tasks.filter(
    (task) => task.status === "TODO"
  ).length;

  const inProgressCount = tasks.filter(
    (task) => task.status === "IN_PROGRESS"
  ).length;

  const doneCount = tasks.filter(
    (task) => task.status === "DONE"
  ).length;

  const completionPercentage =
    tasks.length > 0
      ? Math.round((doneCount / tasks.length) * 100)
      : 0;

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return tasks;
    }

    return tasks.filter(
      (task) =>
        task.title?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.priority?.toLowerCase().includes(query) ||
        task.status?.toLowerCase().includes(query)
    );
  }, [tasks, search]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setFormError("Task title is required.");
      return;
    }

    try {
      setCreating(true);
      setFormError("");

      const response = await api.post(
        `/projects/${projectId}/tasks`,
        {
          title: formData.title.trim(),
          description: formData.description.trim(),
          priority: formData.priority,
          dueDate: formData.dueDate || null,
          assignedTo: formData.assignedTo.trim() || null,
        }
      );

      setTasks((current) => [...current, response.data]);

      setFormData({
        title: "",
        description: "",
        priority: "MEDIUM",
        dueDate: "",
        assignedTo: "",
      });

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

  const closeModal = () => {
    if (creating) {
      return;
    }

    setShowModal(false);

    setFormData({
      title: "",
      description: "",
      priority: "MEDIUM",
      dueDate: "",
      assignedTo: "",
    });

    setFormError("");
  };

  const getStatusStyle = (status) => {
    if (status === "DONE") {
      return "border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-400";
    }

    if (status === "IN_PROGRESS") {
      return "border-blue-400/15 bg-blue-400/[0.07] text-blue-400";
    }

    return "border-white/[0.08] bg-white/[0.025] text-slate-500";
  };

  const getPriorityStyle = (priority) => {
    if (priority === "HIGH") {
      return "text-rose-400";
    }

    if (priority === "MEDIUM") {
      return "text-amber-400";
    }

    return "text-slate-500";
  };

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#080b12]">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-blue-400" />
          <p className="mt-4 text-sm text-slate-500">
            Loading project workspace...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-[#080b12] p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-500/10 bg-red-500/[0.05] p-5 text-sm text-red-400">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="relative min-h-full overflow-hidden bg-[#080b12]">
      {/* Ambient workspace lighting */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-blue-500/[0.06] blur-[120px]" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-cyan-400/[0.035] blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl p-5 sm:p-6 lg:p-8">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/projects")}
          className="group inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition hover:text-white"
        >
          <ArrowLeft
            size={15}
            className="transition-transform group-hover:-translate-x-1"
          />
          Back to Projects
        </button>

        {/* Project hero */}
        <section className="mt-7 overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0c111a]/90 shadow-2xl shadow-black/20">
          <div className="relative p-6 sm:p-8">
            <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-blue-500/[0.06] blur-[90px]" />

            <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-blue-400">
                  <Sparkles size={13} />
                  Project Workspace
                </div>

                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {project.name}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                  {project.description ||
                    "No description provided for this project."}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-[11px] font-medium text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    {project.status}
                  </span>

                  <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-[11px] text-slate-600">
                    {tasks.length}{" "}
                    {tasks.length === 1 ? "task" : "tasks"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFormError("");
                  setShowModal(true);
                }}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-blue-500/10 transition hover:bg-blue-400"
              >
                <Plus size={16} />
                Add Task
              </button>
            </div>
          </div>

          {/* Progress strip */}
          <div className="border-t border-white/[0.06] bg-white/[0.015] px-6 py-4 sm:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CheckCircle2
                  size={14}
                  className="text-emerald-400"
                />
                Project completion
              </div>

              <div className="flex items-center gap-3">
                <div className="h-1.5 w-32 overflow-hidden rounded-full bg-white/[0.06] sm:w-48">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{
                      width: `${completionPercentage}%`,
                    }}
                  />
                </div>

                <span className="text-xs font-medium text-slate-300">
                  {completionPercentage}%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="group rounded-2xl border border-white/[0.07] bg-[#0c111a]/90 p-5 transition hover:border-blue-400/15">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/[0.08]">
                <Layers3
                  size={17}
                  className="text-blue-400"
                />
              </div>

              <span className="text-[10px] uppercase tracking-wider text-slate-700">
                Overall
              </span>
            </div>

            <p className="mt-5 text-3xl font-semibold tracking-tight text-white">
              {tasks.length}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Total tasks
            </p>
          </div>

          <div className="group rounded-2xl border border-white/[0.07] bg-[#0c111a]/90 p-5 transition hover:border-white/[0.12]">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04]">
              <ListTodo
                size={17}
                className="text-slate-400"
              />
            </div>

            <p className="mt-5 text-3xl font-semibold tracking-tight text-white">
              {todoCount}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Waiting to start
            </p>
          </div>

          <div className="group rounded-2xl border border-white/[0.07] bg-[#0c111a]/90 p-5 transition hover:border-blue-400/15">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/[0.08]">
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

          <div className="group rounded-2xl border border-white/[0.07] bg-[#0c111a]/90 p-5 transition hover:border-emerald-400/15">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/[0.07]">
              <CheckCircle2
                size={17}
                className="text-emerald-400"
              />
            </div>

            <p className="mt-5 text-3xl font-semibold tracking-tight text-white">
              {doneCount}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Completed
            </p>
          </div>
        </section>

        {/* Task workspace */}
        <section className="mt-5 overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0c111a]/90">
          {/* Header */}
          <div className="border-b border-white/[0.06] p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-white">
                    Project Tasks
                  </h2>

                  <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-500">
                    {tasks.length}
                  </span>
                </div>

                <p className="mt-1.5 text-xs text-slate-600">
                  Track execution, ownership and delivery.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search tasks..."
                    className="w-full rounded-xl border border-white/[0.07] bg-[#080b12] py-2.5 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-700 focus:border-blue-500/40 sm:w-52"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/tasks")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] px-3.5 py-2.5 text-xs font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
                >
                  Manage Tasks
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Tasks */}
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025]">
                <ListTodo
                  size={20}
                  className="text-slate-600"
                />
              </div>

              <h3 className="mt-4 text-sm font-medium text-slate-300">
                {search
                  ? "No matching tasks"
                  : "No tasks yet"}
              </h3>

              <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-slate-600">
                {search
                  ? "Try a different search term."
                  : "Create your first task to start tracking work in this project."}
              </p>

              {!search && (
                <button
                  type="button"
                  onClick={() => {
                    setFormError("");
                    setShowModal(true);
                  }}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-blue-400"
                >
                  <Plus size={14} />
                  Add First Task
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {filteredTasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() =>
                    navigate(
                      `/projects/${projectId}/tasks/${task.id}`
                    )
                  }
                  className="group flex w-full flex-col gap-4 px-5 py-5 text-left transition hover:bg-white/[0.018] sm:px-6 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                          task.status === "DONE"
                            ? "bg-emerald-400"
                            : task.status === "IN_PROGRESS"
                              ? "bg-blue-400"
                              : "bg-slate-600"
                        }`}
                      />

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-medium text-slate-200 transition group-hover:text-white">
                          {task.title}
                        </h3>

                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
                          {task.description ||
                            "No description provided."}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3 pl-5">
                      {task.assignedToName && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-600">
                          <UserRound size={12} />
                          {task.assignedToName}
                        </span>
                      )}

                      {task.dueDate && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-600">
                          <CalendarDays size={12} />
                          {task.dueDate}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 pl-5 lg:pl-0">
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wide ${getPriorityStyle(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${getStatusStyle(
                        task.status
                      )}`}
                    >
                      {task.status === "IN_PROGRESS"
                        ? "IN PROGRESS"
                        : task.status}
                    </span>

                    <ChevronRight
                      size={15}
                      className="ml-1 text-slate-700 transition group-hover:translate-x-0.5 group-hover:text-slate-400"
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/[0.09] bg-[#0d121b] shadow-2xl shadow-black/50">
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
                    Add Task
                  </h2>
                </div>

                <p className="mt-2 text-xs text-slate-600">
                  Add work to {project.name}.
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
                  placeholder="e.g. Implement dashboard"
                  maxLength={150}
                  required
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
                    <option value="MEDIUM">MEDIUM</option>
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
                  {creating ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetails;