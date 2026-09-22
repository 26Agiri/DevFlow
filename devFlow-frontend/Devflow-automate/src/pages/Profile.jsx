import { useEffect, useState } from "react";
import {
  CalendarDays,
  Camera,
  CheckCircle2,
  Mail,
  Pencil,
  User,
  BriefcaseBusiness,
  Building2,
  Hash,
  Save,
  Loader2,
} from "lucide-react";

import {
  getProfile,
  updateProfile,
} from "../services/profileService";

function Profile() {
  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    designation: "",
    department: "",
    joiningDate: "",
    photoUrl: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProfile();

        setProfile(data);

        setFormData({
          name: data.name || "",
          role: data.role || "",
          designation: data.designation || "",
          department: data.department || "",
          joiningDate: data.joiningDate || "",
          photoUrl: data.photoUrl || "",
        });
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError("Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    if (!profile) {
      return;
    }

    setFormData({
      name: profile.name || "",
      role: profile.role || "",
      designation: profile.designation || "",
      department: profile.department || "",
      joiningDate: profile.joiningDate || "",
      photoUrl: profile.photoUrl || "",
    });

    setEditing(false);
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const updatedProfile = await updateProfile(formData);

      setProfile(updatedProfile);

      setFormData({
        name: updatedProfile.name || "",
        role: updatedProfile.role || "",
        designation: updatedProfile.designation || "",
        department: updatedProfile.department || "",
        joiningDate: updatedProfile.joiningDate || "",
        photoUrl: updatedProfile.photoUrl || "",
      });

      setEditing(false);
      setSuccess("Profile updated successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const formatJoiningDate = (date) => {
    if (!date) {
      return "Not added";
    }

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#080b12]">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2
            size={18}
            className="animate-spin"
          />
          Loading profile...
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-full bg-[#080b12] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-2xl border border-red-400/10 bg-red-500/[0.04] p-5 text-sm text-red-300">
          {error}
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const displayPhoto =
    profile.photoUrl?.trim() || "";

  return (
    <div className="min-h-full bg-[#080b12] px-4 py-6 text-slate-200 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2">
              <User
                size={16}
                className="text-blue-400"
              />

              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Employee Workspace
              </span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              My Profile
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Manage your employee information and profile details.
            </p>
          </div>

          {!editing ? (
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                setError("");
                setSuccess("");
              }}
              className="flex w-fit items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-blue-400/15 hover:bg-blue-500/[0.05] hover:text-white"
            >
              <Pencil size={15} />
              Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-white/[0.04] hover:text-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl border border-blue-400/15 bg-blue-500/[0.1] px-4 py-2.5 text-sm font-medium text-blue-300 transition hover:bg-blue-500/[0.15] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={15} />
                )}

                {saving ? "Saving..." : "Save Changes"}
              </button>

            </div>
          )}

        </div>

        {/* Messages */}
        {success && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.05] px-4 py-3 text-sm text-emerald-300">
            <CheckCircle2 size={16} />
            {success}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-400/10 bg-red-500/[0.04] px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Profile card */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.025] shadow-[0_20px_60px_rgba(0,0,0,0.18)]">

          {/* Profile hero */}
          <div className="border-b border-white/[0.06] p-5 sm:p-6">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

              {/* Photo */}
              <div className="relative shrink-0">

                {displayPhoto ? (
                  <img
                    src={displayPhoto}
                    alt={profile.name || "Profile"}
                    className="h-24 w-24 rounded-2xl border border-white/[0.08] object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-blue-400/10 bg-blue-500/[0.08] text-2xl font-semibold text-blue-300">
                    {(profile.name || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                {editing && (
                  <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-[#111722] text-slate-400">
                    <Camera size={14} />
                  </div>
                )}

              </div>

              {/* Main identity */}
              <div className="min-w-0 flex-1">

                <div className="flex flex-wrap items-center gap-2">

                  <h2 className="text-xl font-semibold text-white">
                    {profile.name || "Employee"}
                  </h2>

                  <span className="rounded-full border border-blue-400/10 bg-blue-400/[0.05] px-2.5 py-1 text-[10px] font-semibold text-blue-300">
                    {profile.role || "Employee"}
                  </span>

                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {profile.designation || "Designation not added"}
                </p>

                <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600">

                  <span className="flex items-center gap-1.5">
                    <Hash size={13} />
                    {profile.employeeId}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Mail size={13} />
                    {profile.email}
                  </span>

                </div>

              </div>

            </div>

          </div>

          {/* Information */}
          <div className="p-5 sm:p-6">

            <div className="mb-5">
              <h3 className="text-sm font-semibold text-slate-300">
                Employee Information
              </h3>

              <p className="mt-1 text-xs text-slate-600">
                Your account and workplace details.
              </p>
            </div>

            {!editing ? (
              <div className="grid gap-3 sm:grid-cols-2">

                {/* Employee ID */}
                <div className="rounded-xl border border-white/[0.05] bg-black/[0.08] p-4">

                  <div className="flex items-center gap-2 text-slate-600">
                    <Hash size={14} />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em]">
                      Employee ID
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-200">
                    {profile.employeeId}
                  </p>

                </div>

                {/* Email */}
                <div className="rounded-xl border border-white/[0.05] bg-black/[0.08] p-4">

                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail size={14} />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em]">
                      Email
                    </span>
                  </div>

                  <p className="mt-2 break-all text-sm font-medium text-slate-200">
                    {profile.email}
                  </p>

                </div>

                {/* Role */}
                <div className="rounded-xl border border-white/[0.05] bg-black/[0.08] p-4">

                  <div className="flex items-center gap-2 text-slate-600">
                    <User size={14} />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em]">
                      Role
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-200">
                    {profile.role || "Not added"}
                  </p>

                </div>

                {/* Designation */}
                <div className="rounded-xl border border-white/[0.05] bg-black/[0.08] p-4">

                  <div className="flex items-center gap-2 text-slate-600">
                    <BriefcaseBusiness size={14} />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em]">
                      Designation
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-200">
                    {profile.designation || "Not added"}
                  </p>

                </div>

                {/* Department */}
                <div className="rounded-xl border border-white/[0.05] bg-black/[0.08] p-4">

                  <div className="flex items-center gap-2 text-slate-600">
                    <Building2 size={14} />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em]">
                      Department
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-200">
                    {profile.department || "Not added"}
                  </p>

                </div>

                {/* Joining date */}
                <div className="rounded-xl border border-white/[0.05] bg-black/[0.08] p-4">

                  <div className="flex items-center gap-2 text-slate-600">
                    <CalendarDays size={14} />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em]">
                      Joining Date
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-200">
                    {formatJoiningDate(
                      profile.joiningDate
                    )}
                  </p>

                </div>

              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">

                {/* Name */}
                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-slate-500">
                    Full Name
                  </span>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    maxLength={100}
                    className="w-full rounded-xl border border-white/[0.07] bg-black/[0.12] px-4 py-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-700 focus:border-blue-400/20 focus:bg-white/[0.025]"
                    placeholder="Enter your name"
                  />
                </label>

                {/* Role */}
                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-slate-500">
                    Role
                  </span>

                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    maxLength={50}
                    className="w-full rounded-xl border border-white/[0.07] bg-black/[0.12] px-4 py-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-700 focus:border-blue-400/20 focus:bg-white/[0.025]"
                    placeholder="Employee"
                  />
                </label>

                {/* Designation */}
                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-slate-500">
                    Designation
                  </span>

                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    maxLength={100}
                    className="w-full rounded-xl border border-white/[0.07] bg-black/[0.12] px-4 py-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-700 focus:border-blue-400/20 focus:bg-white/[0.025]"
                    placeholder="Full Stack Developer"
                  />
                </label>

                {/* Department */}
                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-slate-500">
                    Department
                  </span>

                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    maxLength={100}
                    className="w-full rounded-xl border border-white/[0.07] bg-black/[0.12] px-4 py-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-700 focus:border-blue-400/20 focus:bg-white/[0.025]"
                    placeholder="Engineering"
                  />
                </label>

                {/* Joining Date */}
                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-slate-500">
                    Joining Date
                  </span>

                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/[0.07] bg-black/[0.12] px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-blue-400/20 focus:bg-white/[0.025]"
                  />
                </label>

                {/* Photo URL */}
                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-slate-500">
                    Profile Photo URL
                  </span>

                  <input
                    type="url"
                    name="photoUrl"
                    value={formData.photoUrl}
                    onChange={handleChange}
                    maxLength={500}
                    className="w-full rounded-xl border border-white/[0.07] bg-black/[0.12] px-4 py-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-700 focus:border-blue-400/20 focus:bg-white/[0.025]"
                    placeholder="https://example.com/profile.jpg"
                  />
                </label>

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;