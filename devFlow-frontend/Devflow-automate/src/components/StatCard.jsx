function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0f141e] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-blue-500/20 hover:bg-[#111824]">

      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
        {value}
      </p>

      <div className="mt-4 h-px w-8 bg-blue-400/60" />

    </div>
  );
}

export default StatCard;