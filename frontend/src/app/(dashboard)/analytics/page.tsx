export default function AnalyticsPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <button className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-md hover:bg-muted">
          Export
        </button>
      </div>

      {/* Analytics charts will be added here */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="p-6 bg-card rounded-lg border border-border">
          <h2 className="text-lg font-medium text-foreground">
            Transaction Volume
          </h2>
          <div className="h-64 mt-4 flex items-center justify-center text-muted-foreground">
            Chart will be displayed here
          </div>
        </div>
        <div className="p-6 bg-card rounded-lg border border-border">
          <h2 className="text-lg font-medium text-foreground">
            Gas Usage by Paymaster
          </h2>
          <div className="h-64 mt-4 flex items-center justify-center text-muted-foreground">
            Chart will be displayed here
          </div>
        </div>
      </div>
    </div>
  );
}
