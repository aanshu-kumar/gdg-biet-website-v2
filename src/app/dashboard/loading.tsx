/** Shown instantly in the content area while a dashboard page loads; the sidebar stays put. */
export default function DashboardLoading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="animate-pulse">
      <div className="mb-8 space-y-3">
        <div className="h-8 w-56 rounded-full bg-surface-2" />
        <div className="h-4 w-80 max-w-full rounded-full bg-surface-2" />
      </div>
      <div className="mb-6 h-11 w-72 max-w-full rounded-full bg-surface-2" />
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[72px] rounded-3xl bg-surface-2" style={{ opacity: 1 - i * 0.18 }} />
        ))}
      </div>
    </div>
  );
}
