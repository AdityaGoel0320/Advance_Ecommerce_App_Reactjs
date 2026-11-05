const Loading = ({ label = "Loading your content...", compact = false }: { label?: string; compact?: boolean }) => (
  <div role="status" aria-live="polite" className={compact
    ? "flex items-center justify-center gap-3 py-4 text-sm text-subtle"
    : "mx-auto flex min-h-64 max-w-screen-xl flex-col items-center justify-center gap-4 px-6 py-12 text-center"}>
    <span aria-hidden="true" className="relative inline-flex h-10 w-10 items-center justify-center">
      <span className="absolute inset-0 rounded-full border-[3px] border-indigo-500/15" />
      <span className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-indigo-500 motion-safe:animate-spin" />
      <span className="h-2 w-2 rounded-full bg-indigo-500" />
    </span>
    <p className="text-sm font-medium text-subtle">{label}</p>
  </div>
);

export default Loading;
