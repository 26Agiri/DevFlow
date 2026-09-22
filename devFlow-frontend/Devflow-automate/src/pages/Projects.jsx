import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  FolderKanban,
  Layers3,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [formError, setFormError] = useState("");
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/projects");
      setProjects(response.data);
    } catch (error) {
      console.error("Projects error:", error);
      setError(
        error.response?.data?.message ||
          "Unable to load projects."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();

    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Project name is required.");
      return;
    }

    if (editingProject) {
      setUpdating(true);

      try {
        const response = await api.put(
          `/projects/${editingProject.id}`,
          {
            name: formData.name.trim(),
            description: formData.description.trim(),
            status: editingProject.status,
          }
        );

        setProjects((current) =>
          current.map((project) =>
            project.id === editingProject.id
              ? response.data
              : project
          )
        );

        closeModal();
      } catch (error) {
        console.error("Update project error:", error);

        setFormError(
          error.response?.data?.message ||
            "Unable to update project."
        );
      } finally {
        setUpdating(false);
      }

      return;
    }

    setCreating(true);

    try {
      const response = await api.post("/projects", {
        name: formData.name.trim(),
        description: formData.description.trim(),
      });

      setProjects((current) => [
        ...current,
        response.data,
      ]);

      closeModal();
    } catch (error) {
      console.error("Create project error:", error);

      setFormError(
        error.response?.data?.message ||
          "Unable to create project."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/projects/${projectId}`);

      setProjects((current) =>
        current.filter(
          (project) => project.id !== projectId
        )
      );
    } catch (error) {
      console.error("Delete project error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to delete project."
      );
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);

    setFormData({
      name: project.name,
      description: project.description || "",
    });

    setFormError("");
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingProject(null);

    setFormData({
      name: "",
      description: "",
    });

    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (creating || updating) {
      return;
    }

    setShowModal(false);

    setFormData({
      name: "",
      description: "",
    });

    setFormError("");
    setEditingProject(null);
  };

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return projects;
    }

    return projects.filter(
      (project) =>
        project.name?.toLowerCase().includes(query) ||
        project.description
          ?.toLowerCase()
          .includes(query) ||
        project.status?.toLowerCase().includes(query)
    );
  }, [projects, search]);

  const activeProjects = projects.filter(
    (project) =>
      project.status === "ACTIVE" ||
      project.status === "IN_PROGRESS"
  ).length;

  const completedProjects = projects.filter(
    (project) =>
      project.status === "COMPLETED" ||
      project.status === "DONE"
  ).length;

  if (loading) {
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
      {/* Ambient lighting */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-blue-500/[0.06] blur-[120px]" />

        <div className="absolute right-0 top-56 h-96 w-96 rounded-full bg-cyan-400/[0.035] blur-[140px]" />

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
                  <Layers3 size={13} />
                  Developer Workspace
                </div>

                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Projects
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                  Organize products, features and engineering
                  work from one workspace.
                </p>
              </div>

              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-blue-500/10 transition hover:bg-blue-400"
              >
                <Plus size={16} />
                New Project
              </button>
            </div>
          </div>

          {/* Workspace summary */}
          <div className="grid border-t border-white/[0.06] sm:grid-cols-3">
            <div className="border-b border-white/[0.06] px-6 py-5 sm:border-b-0 sm:border-r sm:px-8">
              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <FolderKanban size={13} />
                Total projects
              </div>

              <p className="mt-2 text-2xl font-semibold text-white">
                {projects.length}
              </p>
            </div>

            <div className="border-b border-white/[0.06] px-6 py-5 sm:border-b-0 sm:border-r sm:px-8">
              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                Active
              </div>

              <p className="mt-2 text-2xl font-semibold text-white">
                {activeProjects}
              </p>
            </div>

            <div className="px-6 py-5 sm:px-8">
              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <CheckCircle2 size={13} />
                Completed
              </div>

              <p className="mt-2 text-2xl font-semibold text-white">
                {completedProjects}
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

        {/* Toolbar */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Your Projects
            </h2>

            <p className="mt-1 text-xs text-slate-600">
              {filteredProjects.length}{" "}
              {filteredProjects.length === 1
                ? "project"
                : "projects"}{" "}
              in view
            </p>
          </div>

          <div className="relative">
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
              placeholder="Search projects..."
              className="w-full rounded-xl border border-white/[0.07] bg-[#0c111a] py-2.5 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-700 focus:border-blue-500/40 sm:w-64"
            />
          </div>
        </div>

        {/* Project grid */}
        {filteredProjects.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-white/[0.07] bg-[#0c111a]/90 p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025]">
              <FolderKanban
                size={23}
                className="text-slate-600"
              />
            </div>

            <h2 className="mt-5 text-base font-semibold text-white">
              {search
                ? "No projects found"
                : "No projects yet"}
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-600">
              {search
                ? "Try another project name or search term."
                : "Create your first project and start organizing your development work."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-blue-400"
              >
                <Plus size={14} />
                Create Project
              </button>
            )}
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <article
                key={project.id}
                className="group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0c111a]/90 transition duration-300 hover:-translate-y-0.5 hover:border-blue-400/15 hover:shadow-xl hover:shadow-black/20"
              >
                {/* Top accent */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-400/30 to-transparent opacity-0 transition group-hover:opacity-100" />

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-400/10 bg-blue-500/[0.07] text-blue-400">
                        <FolderKanban size={19} />
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold text-white">
                          {project.name}
                        </h2>

                        <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-slate-700">
                          Project #{project.id}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 rounded-full border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-[10px] font-medium text-slate-500">
                      {project.status}
                    </span>
                  </div>

                  <p className="mt-5 min-h-[48px] text-sm leading-6 text-slate-500">
                    {project.description ||
                      "No description provided."}
                  </p>

                  <div className="mt-5 flex items-center gap-2 border-t border-white/[0.06] pt-4">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/projects/${project.id}`
                        )
                      }
                      className="group/view inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-500 px-3 py-2.5 text-xs font-medium text-white transition hover:bg-blue-400"
                    >
                      Open Workspace
                      <ArrowUpRight
                        size={14}
                        className="transition-transform group-hover/view:translate-x-0.5 group-hover/view:-translate-y-0.5"
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleEditProject(project)
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] text-slate-500 transition hover:bg-white/[0.04] hover:text-white"
                      title="Edit project"
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteProject(project.id)
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/10 text-red-400 transition hover:bg-red-500/[0.06]"
                      title="Delete project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/[0.09] bg-[#0d121b] shadow-2xl shadow-black/50">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-[#0d121b]/95 px-6 py-5 backdrop-blur">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/[0.09]">
                    {editingProject ? (
                      <Pencil
                        size={14}
                        className="text-blue-400"
                      />
                    ) : (
                      <Plus
                        size={15}
                        className="text-blue-400"
                      />
                    )}
                  </div>

                  <h2 className="text-base font-semibold text-white">
                    {editingProject
                      ? "Edit Project"
                      : "New Project"}
                  </h2>
                </div>

                <p className="mt-2 text-xs text-slate-600">
                  {editingProject
                    ? "Update your project details."
                    : "Create a new project in your workspace."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={creating || updating}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
              >
                <X size={17} />
              </button>
            </div>

            <form
              onSubmit={handleSaveProject}
              className="p-6"
            >
              {formError && (
                <div className="mb-5 rounded-xl border border-red-500/10 bg-red-500/[0.05] px-4 py-3 text-xs text-red-400">
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Project Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Developer Portfolio"
                  maxLength={100}
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
                  placeholder="What are you building?"
                  maxLength={1000}
                  rows={5}
                  className="w-full resize-none rounded-xl border border-white/[0.08] bg-[#080b12] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-700 focus:border-blue-500/50"
                />

                <p className="mt-2 text-right text-[10px] text-slate-700">
                  {formData.description.length}/1000
                </p>
              </div>

              <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={creating || updating}
                  className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating || updating}
                  className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/10 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating || updating
                    ? editingProject
                      ? "Updating..."
                      : "Creating..."
                    : editingProject
                      ? "Update Project"
                      : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;