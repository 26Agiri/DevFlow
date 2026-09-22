import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  MessageSquare,
  Pencil,
  Send,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function TaskDetails() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);

  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] =
    useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [editingCommentId, setEditingCommentId] =
    useState(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    const loadTask = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/projects/${projectId}/tasks/${taskId}`
        );

        setTask(response.data);
      } catch (error) {
        console.error("Task details error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load task."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [projectId, taskId]);

  useEffect(() => {
    const loadComments = async () => {
      try {
        setLoadingComments(true);

        const response = await api.get(
          `/projects/${projectId}/tasks/${taskId}/comments`
        );

        setComments(response.data);
      } catch (error) {
        console.error("Comments error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load comments."
        );
      } finally {
        setLoadingComments(false);
      }
    };

    loadComments();
  }, [projectId, taskId]);

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await api.post(
        `/projects/${projectId}/tasks/${taskId}/comments`,
        {
          content: comment.trim(),
        }
      );

      setComments((current) => [
        ...current,
        response.data,
      ]);

      setComment("");
    } catch (error) {
      console.error("Add comment error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to add comment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const confirmed = window.confirm(
      "Delete this comment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(
        `/projects/${projectId}/tasks/${taskId}/comments/${commentId}`
      );

      setComments((current) =>
        current.filter((item) => item.id !== commentId)
      );
    } catch (error) {
      console.error("Delete comment error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to delete comment."
      );
    }
  };

  const startEditing = (item) => {
    setEditingCommentId(item.id);
    setEditingText(item.content);
    setError("");
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditingText("");
  };

  const handleUpdateComment = async (commentId) => {
    if (!editingText.trim()) {
      return;
    }

    try {
      setError("");

      const response = await api.put(
        `/projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
        {
          content: editingText.trim(),
        }
      );

      setComments((current) =>
        current.map((item) =>
          item.id === commentId
            ? response.data
            : item
        )
      );

      cancelEditing();
    } catch (error) {
      console.error("Update comment error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to update comment."
      );
    }
  };

  const getStatusIcon = (status, size = 18) => {
    if (status === "DONE") {
      return (
        <CheckCircle2
          size={size}
          className="text-emerald-400"
        />
      );
    }

    if (status === "IN_PROGRESS") {
      return (
        <Clock3
          size={size}
          className="text-blue-400"
        />
      );
    }

    return (
      <Circle
        size={size}
        className="text-slate-600"
      />
    );
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

  const getPriorityClass = (priority) => {
    if (priority === "HIGH") {
      return "border-rose-400/15 bg-rose-400/[0.06] text-rose-400";
    }

    if (priority === "MEDIUM") {
      return "border-amber-400/15 bg-amber-400/[0.05] text-amber-400";
    }

    return "border-white/[0.08] bg-white/[0.025] text-slate-500";
  };

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#080b12]">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-blue-400" />

          <p className="mt-4 text-sm text-slate-500">
            Loading task...
          </p>
        </div>
      </div>
    );
  }

  if (error && !task) {
    return (
      <div className="min-h-full bg-[#080b12] p-5 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-red-500/10 bg-red-500/[0.05] p-5 text-sm text-red-400">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return null;
  }

  return (
    <div className="relative min-h-full overflow-hidden bg-[#080b12]">
      {/* Ambient lighting */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-0 h-80 w-80 rounded-full bg-blue-500/[0.06] blur-[120px]" />

        <div className="absolute right-0 top-60 h-96 w-96 rounded-full bg-cyan-400/[0.03] blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl p-5 sm:p-6 lg:p-8">
        {/* Back navigation */}
        <button
          type="button"
          onClick={() =>
            navigate(`/projects/${projectId}`)
          }
          className="group inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition hover:text-white"
        >
          <ArrowLeft
            size={15}
            className="transition-transform group-hover:-translate-x-1"
          />
          Back to Project
        </button>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-2xl border border-red-500/10 bg-red-500/[0.05] px-5 py-4 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Task hero */}
        <section className="relative mt-7 overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0c111a]/90 shadow-2xl shadow-black/20">
          <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-blue-500/[0.05] blur-[100px]" />

          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
              {/* Status */}
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${getStatusClass(
                  task.status
                )}`}
              >
                {getStatusIcon(task.status, 21)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-blue-400">
                      Task Details
                    </p>

                    <h1 className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                      {task.title}
                    </h1>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide ${getPriorityClass(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>

                    <span
                      className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide ${getStatusClass(
                        task.status
                      )}`}
                    >
                      {task.status === "IN_PROGRESS"
                        ? "IN PROGRESS"
                        : task.status}
                    </span>
                  </div>
                </div>

                <p className="mt-5 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-slate-500">
                  {task.description ||
                    "No description provided."}
                </p>

                {/* Metadata */}
                <div className="mt-6 flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.018] px-3 py-2 text-[11px] text-slate-500">
                    <CalendarDays size={13} />
                    <span className="text-slate-700">
                      Due
                    </span>
                    {task.dueDate || "No due date"}
                  </div>

                  {task.assignedToName && (
                    <div className="inline-flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.018] px-3 py-2 text-[11px] text-slate-500">
                      <UserRound size={13} />
                      <span className="text-slate-700">
                        Assigned
                      </span>
                      {task.assignedToName}
                    </div>
                  )}

                  <div className="inline-flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.018] px-3 py-2 text-[11px] text-slate-500">
                    <span className="text-slate-700">
                      Task
                    </span>
                    #{task.id}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Workflow strip */}
          <div className="border-t border-white/[0.06] bg-white/[0.012] px-6 py-5 sm:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-700">
                  Workflow
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Current task state
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    task.status === "TODO"
                      ? "bg-slate-500"
                      : "bg-white/[0.08]"
                  }`}
                />

                <div
                  className={`h-px w-8 ${
                    task.status === "IN_PROGRESS" ||
                    task.status === "DONE"
                      ? "bg-blue-400/50"
                      : "bg-white/[0.06]"
                  } sm:w-12`}
                />

                <div
                  className={`h-2 w-2 rounded-full ${
                    task.status === "IN_PROGRESS"
                      ? "bg-blue-400"
                      : task.status === "DONE"
                        ? "bg-blue-400"
                        : "bg-white/[0.08]"
                  }`}
                />

                <div
                  className={`h-px w-8 ${
                    task.status === "DONE"
                      ? "bg-emerald-400/50"
                      : "bg-white/[0.06]"
                  } sm:w-12`}
                />

                <div
                  className={`h-2 w-2 rounded-full ${
                    task.status === "DONE"
                      ? "bg-emerald-400"
                      : "bg-white/[0.08]"
                  }`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Comments */}
        <section className="mt-5 overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0c111a]/90">
          {/* Header */}
          <div className="border-b border-white/[0.06] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/[0.07]">
                  <MessageSquare
                    size={17}
                    className="text-blue-400"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-white">
                      Discussion
                    </h2>

                    <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-500">
                      {comments.length}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-600">
                    Keep task conversations close to the work.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Add comment */}
          <form
            onSubmit={handleAddComment}
            className="border-b border-white/[0.06] p-5 sm:p-6"
          >
            <div className="rounded-2xl border border-white/[0.07] bg-[#080b12] p-3">
              <textarea
                value={comment}
                onChange={(e) =>
                  setComment(e.target.value)
                }
                placeholder="Write an update, question or note..."
                rows={4}
                maxLength={2000}
                className="w-full resize-none bg-transparent px-1 py-1 text-sm leading-6 text-white outline-none placeholder:text-slate-700"
              />

              <div className="mt-2 flex items-center justify-between border-t border-white/[0.05] pt-3">
                <span className="text-[10px] text-slate-700">
                  {comment.length}/2000
                </span>

                <button
                  type="submit"
                  disabled={
                    submitting || !comment.trim()
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-xs font-medium text-white shadow-lg shadow-blue-500/10 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={13} />

                  {submitting
                    ? "Posting..."
                    : "Add Comment"}
                </button>
              </div>
            </div>
          </form>

          {/* Comments */}
          {loadingComments ? (
            <div className="p-12 text-center">
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-blue-400" />

              <p className="mt-4 text-xs text-slate-600">
                Loading discussion...
              </p>
            </div>
          ) : comments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025]">
                <MessageSquare
                  size={20}
                  className="text-slate-600"
                />
              </div>

              <h3 className="mt-4 text-sm font-medium text-slate-300">
                No discussion yet
              </h3>

              <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-slate-600">
                Start the conversation by posting the
                first comment.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {comments.map((item) => (
                <article
                  key={item.id}
                  className="p-5 transition hover:bg-white/[0.012] sm:p-6"
                >
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.035] text-xs font-medium text-slate-400">
                      {(
                        item.userName ||
                        item.user?.name ||
                        "U"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Comment header */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-slate-200">
                          {item.userName ||
                            item.user?.name ||
                            "User"}
                        </span>

                        {item.createdAt && (
                          <span className="text-[10px] text-slate-700">
                            {new Date(
                              item.createdAt
                            ).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Edit */}
                      {editingCommentId ===
                      item.id ? (
                        <div className="mt-3">
                          <textarea
                            value={editingText}
                            onChange={(e) =>
                              setEditingText(
                                e.target.value
                              )
                            }
                            rows={4}
                            maxLength={2000}
                            autoFocus
                            className="w-full resize-none rounded-xl border border-white/[0.08] bg-[#080b12] px-4 py-3 text-sm leading-6 text-white outline-none focus:border-blue-500/50"
                          />

                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-[10px] text-slate-700">
                              {editingText.length}/2000
                            </span>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateComment(
                                    item.id
                                  )
                                }
                                disabled={
                                  !editingText.trim()
                                }
                                className="rounded-lg bg-blue-500 px-3 py-2 text-[11px] font-medium text-white transition hover:bg-blue-400 disabled:opacity-50"
                              >
                                Save Changes
                              </button>

                              <button
                                type="button"
                                onClick={cancelEditing}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-2 text-[11px] text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
                              >
                                <X size={12} />
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-500">
                            {item.content}
                          </p>

                          <div className="mt-3 flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                startEditing(item)
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] text-slate-600 transition hover:bg-white/[0.04] hover:text-slate-300"
                            >
                              <Pencil size={12} />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteComment(
                                  item.id
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] text-slate-600 transition hover:bg-red-500/[0.05] hover:text-red-400"
                            >
                              <Trash2 size={12} />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default TaskDetails;