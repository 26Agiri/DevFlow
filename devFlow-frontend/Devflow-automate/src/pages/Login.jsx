import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionWarning, setSessionWarning] = useState("");

 const handleSubmit = async (e) => {
  e.preventDefault();

  setLoading(true);
  setError("");

  try {
    const data = await loginUser(email, password);

    console.log("Login successful:", data);

    localStorage.setItem("token", data.token);

    if (data.heartbeatTimeout) {
      setSessionWarning(
        "Your previous work session ended because DevFlow did not receive activity for 5 minutes. Keep this tab active while working."
      );

      setTimeout(() => {
        navigate("/dashboard");
      }, 2500);

      return;
    }

    navigate("/dashboard");
  } catch (error) {
    console.error("Login failed:", error);

    setError(
      error.response?.data?.message ||
        "Invalid email or password"
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070a10] text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-[-10%] h-[520px] w-[520px] rounded-full bg-blue-500/[0.07] blur-[140px]" />

        <div className="absolute bottom-[-12%] right-[-8%] h-[520px] w-[520px] rounded-full bg-cyan-400/[0.035] blur-[150px]" />

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
          <div className="grid lg:min-h-[650px] lg:grid-cols-[1.05fr_0.95fr]">

            {/* LEFT PANEL */}
            <section className="relative hidden overflow-hidden border-r border-white/[0.06] bg-[#090d14] p-8 lg:flex lg:flex-col lg:justify-between xl:p-12">
              <div className="pointer-events-none absolute right-[-15%] top-[-10%] h-96 w-96 rounded-full bg-blue-500/[0.05] blur-[110px]" />

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

                {/* Main message */}
                <div className="mt-20">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-blue-400">
                    <Terminal size={13} />
                    Developer Control Plane
                  </div>

                  <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
                    Turn ideas into
                    <span className="block text-blue-400">
                      progress.
                    </span>
                  </h1>

                  <p className="mt-5 max-w-lg text-sm leading-7 text-slate-500">
                    A focused workspace for projects, tasks,
                    deadlines and team execution.
                  </p>
                </div>

                {/* Terminal */}
                <div className="mt-10 max-w-xl rounded-2xl border border-white/[0.07] bg-[#070a10]">
                  <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-slate-700" />
                      <span className="h-2 w-2 rounded-full bg-slate-700" />
                      <span className="h-2 w-2 rounded-full bg-slate-700" />
                    </div>

                    <span className="text-[9px] uppercase tracking-[0.2em] text-slate-700">
                      devflow.shell
                    </span>
                  </div>

                  <div className="space-y-4 p-5 font-mono text-xs">
                    <div>
                      <span className="text-blue-400">
                        $
                      </span>{" "}
                      <span className="text-slate-400">
                        workspace
                      </span>{" "}
                      <span className="text-white">
                        --status
                      </span>
                    </div>

                    <div className="pl-4 text-slate-600">
                      workspace:{" "}
                      <span className="text-slate-300">
                        ready
                      </span>
                    </div>

                    <div className="pl-4 text-slate-600">
                      projects:{" "}
                      <span className="text-slate-300">
                        connected
                      </span>
                    </div>

                    <div className="pl-4 text-slate-600">
                      execution:{" "}
                      <span className="text-blue-400">
                        active
                      </span>
                    </div>

                    <div>
                      <span className="text-blue-400">
                        $
                      </span>{" "}
                      <span className="text-slate-400">
                        devflow
                      </span>{" "}
                      <span className="text-white">
                        --launch
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
                    Workspace ready
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <ShieldCheck
                    size={14}
                    className="text-blue-400"
                  />

                  <span className="text-[11px] text-slate-600">
                    Secure session
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
                    <LockKeyhole size={12} />
                    Auth / Workspace
                  </div>

                  <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
                    Welcome back.
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Sign in to continue to your developer
                    workspace.
                  </p>
                </div>
          {/* Session Warning */}
{sessionWarning && (
  <div className="mt-7 rounded-xl border border-amber-400/10 bg-amber-400/[0.05] px-4 py-3 text-xs leading-5 text-amber-300">
    {sessionWarning}
  </div>
)}
                {/* Error */}
                {error && (
                  <div className="mt-7 rounded-xl border border-red-500/10 bg-red-500/[0.05] px-4 py-3 text-xs leading-5 text-red-400">
                    {error}
                  </div>
                )}

                {/* Form */}
                <form
                  onSubmit={handleSubmit}
                  className="mt-8 space-y-5"
                >
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
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      className="w-full rounded-xl border border-white/[0.08] bg-[#080b12] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-blue-400/40 focus:bg-[#090d14]"
                    />
                  </div>

                  {/* Login */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3.5 text-sm font-medium text-white shadow-lg shadow-blue-500/10 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? "Authenticating..."
                      : "Enter Workspace"}

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
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                      <span className="text-[10px] text-slate-700">
                        SYSTEM ONLINE
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-700">
                      DEVFLOW / AUTH
                    </span>
                  </div>

                  {/* Register */}
                  <div className="mt-6 text-center">
                    <p className="text-xs text-slate-600">
                      Don't have a DevFlow account?
                    </p>

                    <Link
                      to="/register"
                      className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 transition hover:text-blue-300"
                    >
                      Create an account
                      <ArrowRight
                        size={14}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
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

export default Login;