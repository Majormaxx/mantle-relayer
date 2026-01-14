export default function DangerZoneSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-foreground">Danger Zone</h2>
        <p className="text-sm text-muted-foreground">
          Irreversible and destructive actions.
        </p>
      </div>

      <div className="p-6 bg-card rounded-lg border border-error/50 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-medium text-foreground">
              Withdraw All Funds
            </h3>
            <p className="text-sm text-muted-foreground">
              Transfer all MNT from all Paymasters back to your wallet.
            </p>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-white bg-error rounded-md hover:bg-error/90">
            Withdraw All
          </button>
        </div>

        <div className="border-t border-border pt-6 flex items-start justify-between">
          <div>
            <h3 className="text-sm font-medium text-foreground">
              Pause All Paymasters
            </h3>
            <p className="text-sm text-muted-foreground">
              Immediately stop all Paymasters from sponsoring transactions.
            </p>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-error border border-error rounded-md hover:bg-error/10">
            Pause All
          </button>
        </div>
      </div>
    </div>
  );
}
