export default function NotificationsSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-foreground">Notifications</h2>
        <p className="text-sm text-muted-foreground">
          Configure how you receive alerts and updates.
        </p>
      </div>

      <div className="p-6 bg-card rounded-lg border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-foreground">
              Low Balance Alerts
            </h3>
            <p className="text-sm text-muted-foreground">
              Get notified when Paymaster balance is low.
            </p>
          </div>
          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted">
            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-foreground">
              Transaction Alerts
            </h3>
            <p className="text-sm text-muted-foreground">
              Get notified on failed transactions.
            </p>
          </div>
          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted">
            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
