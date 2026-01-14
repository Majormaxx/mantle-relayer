export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome to your Mantle Gasless Relayer dashboard.
      </p>

      {/* Stats cards will be added here */}
      <div className="grid grid-cols-1 gap-4 mt-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Total Balance</p>
          <p className="mt-2 text-2xl font-bold text-foreground">0 MNT</p>
        </div>
        <div className="p-6 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Active Paymasters</p>
          <p className="mt-2 text-2xl font-bold text-foreground">0</p>
        </div>
        <div className="p-6 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Total Transactions</p>
          <p className="mt-2 text-2xl font-bold text-foreground">0</p>
        </div>
        <div className="p-6 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">This Month</p>
          <p className="mt-2 text-2xl font-bold text-foreground">$0.00</p>
        </div>
      </div>
    </div>
  );
}
