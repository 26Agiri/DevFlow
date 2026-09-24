import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Code2,
  LockKeyhole,
  ShieldCheck,
  Terminal,
  UserPlus,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
console.log("REGISTER BUTTON / FORM SUBMITTED");
    setError("");
    setSuccess("");
    
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await registerUser(
        name.trim(),
        email.trim(),
        password
      );

      setSuccess(
        "Account created successfully. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      console.error("Registration failed:", error);

      setError(
        error.response?.data?.message ||
          "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070a10] text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-12%] h-[520px] w-[520px] rounded-full bg-blue-500/[0.07] blur-[140px]" />

        <div className="absolute bottom-[-15%] right-[-10%] h-[520px] w-[520px] rounded-full bg-cyan-400/[0.035] blur-[150px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Main */}
      <div className="relative flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0b0f17]/95 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div className="grid lg:min-h-[700px] lg:grid-cols-[0.95fr_1.05fr]">

            {/* LEFT PANEL */}
            <section className="relative hidden overflow-hidden border-r border-white/[0.06] bg-[#090d14] p-8 lg:flex lg:flex-col lg:justify-between xl:p-12">
              <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-blue-500/[0.045] blur-[110px]" />

              {/* Brand */}
              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-400/10 bg-blue-500/[0.08]">
                    <span className="text-sm font-bold text-blue-400">
                      D
                    </span>
                  </div>

                  <div>
                    <p className="text-[15px] font-semibold tracking-tight text-white">
                      DevFlow
                    </p>

                    <p className="text-[10px] text-slate-600">
                      Developer workspace
                    </p>
                  </div>
                </div>

                {/* Message */}
                <div className="mt-20">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-blue-400">
                    <UserPlus size={13} />
                    Initialize Workspace
                  </div>

                  <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
                    Build.
                    <span className="block text-blue-400">
                      Organize.
                    </span>
                    Ship.
                  </h1>

                  <p className="mt-5 max-w-lg text-sm leading-7 text-slate-500">
                    Create your developer workspace and keep
                    projects, tasks and execution connected.
                  </p>
                </div>

                {/* Developer stack visual */}
                <div className="mt-10 max-w-xl rounded-2xl border border-white/[0.07] bg-[#070a10]">
                  <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-slate-700" />
                      <span className="h-2 w-2 rounded-full bg-slate-700" />
                      <span className="h-2 w-2 rounded-full bg-slate-700" />
                    </div>

                    <span className="text-[9px] uppercase tracking-[0.2em] text-slate-700">
                      setup.config
                    </span>
                  </div>

                  <div className="space-y-4 p-5 font-mono text-xs">
                    <div>
                      <span className="text-blue-400">
                        $
                      </span>{" "}
                      <span className="text-slate-400">
                        devflow
                      </span>{" "}
                      <span className="text-white">
                        --init
                      </span>
                    </div>

                    <div className="pl-4 text-slate-600">
                      identity:{" "}
                      <span className="text-slate-300">
                        developer
                      </span>
                    </div>

                    <div className="pl-4 text-slate-600">
                      workspace:{" "}
                      <span className="text-blue-400">
                        initializing
                      </span>
                    </div>

                    <div className="pl-4 text-slate-600">
                      projects:{" "}
                      <span className="text-slate-300">
                        ready
                      </span>
                    </div>

                    <div>
                      <span className="text-blue-400">
                        $
                      </span>{" "}
                      <span className="text-slate-400">
                        workspace
                      </span>{" "}
                      <span className="text-white">
                        --create
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom */}
              <div className="relative flex items-center gap-6 border-t border-white/[0.06] pt-5">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={14}
                    className="text-emerald-400"
                  />

                  <span className="text-[11px] text-slate-600">
                    Ready to build
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <ShieldCheck
                    size={14}
                    className="text-blue-400"
                  />

                  <span className="text-[11px] text-slate-600">
                    Secure account
                  </span>
                </div>
              </div>
            </section>

            {/* RIGHT PANEL */}
            <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16">
              <div className="w-full max-w-md">

                {/* Mobile brand */}
                <div className="mb-10 flex items-center gap-3 lg:hidden">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/10 bg-blue-500/[0.08] text-sm font-bold text-blue-400">
                    D
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      DevFlow
                    </p>

                    <p className="text-[10px] text-slate-600">
                      Developer workspace
                    </p>
                  </div>
                </div>

                {/* Heading */}
                <div>
                  <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-700">
                    <Code2 size={12} />
                    Auth / Initialize
                  </div>

                  <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
                    Create your workspace.
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Set up your DevFlow account and start building.
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="mt-7 rounded-xl border border-red-500/10 bg-red-500/[0.05] px-4 py-3 text-xs leading-5 text-red-400">
                    {error}
                  </div>
                )}

                {/* Success */}
                {success && (
                  <div className="mt-7 flex items-start gap-3 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.05] px-4 py-3 text-xs leading-5 text-emerald-400">
                    <CheckCircle2
                      size={15}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{success}</span>
                  </div>
                )}

                {/* Form */}
                <form
                  onSubmit={handleSubmit}
                  className="mt-8 space-y-5"
                >
                  {/* Name */}
                  <div>
                    <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
                      Full Name
                    </label>

                    <input
                      type="text"
                      value={name}
                      onChange={(e) =>
                        setName(e.target.value)
                      }
                      placeholder="Your name"
                      maxLength={100}
                      required
                      autoComplete="name"
                      className="w-full rounded-xl border border-white/[0.08] bg-[#080b12] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-blue-400/40 focus:bg-[#090d14]"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
                      Email
                    </label>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      className="w-full rounded-xl border border-white/[0.08] bg-[#080b12] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-blue-400/40 focus:bg-[#090d14]"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
                      Password
                    </label>

                    <input
                      type="password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="Minimum 6 characters"
                      minLength={6}
                      maxLength={100}
                      required
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-white/[0.08] bg-[#080b12] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-blue-400/40 focus:bg-[#090d14]"
                    />
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
                      Confirm Password
                    </label>

                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      placeholder="Repeat your password"
                      minLength={6}
                      maxLength={100}
                      required
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-white/[0.08] bg-[#080b12] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-blue-400/40 focus:bg-[#090d14]"
                    />
                  </div>

                  {/* Register */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3.5 text-sm font-medium text-white shadow-lg shadow-blue-500/10 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? "Creating workspace..."
                      : "Create Account"}

                    {!loading && (
                      <ArrowRight
                        size={15}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    )}
                  </button>
                </form>

                {/* Footer */}
                <div className="mt-8 border-t border-white/[0.06] pt-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <LockKeyhole
                        size={11}
                        className="text-slate-700"
                      />

                      <span className="text-[10px] text-slate-700">
                        SECURE REGISTRATION
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-700">
                      DEVFLOW / AUTH
                    </span>
                  </div>

                  <div className="mt-6 flex items-center justify-center">
                    <Link
                      to="/login"
                      className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-white"
                    >
                      <ArrowLeft
                        size={14}
                        className="transition-transform group-hover:-translate-x-0.5"
                      />

                      Already have an account?
                      <span className="text-blue-400 group-hover:text-blue-300">
                        Login
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;