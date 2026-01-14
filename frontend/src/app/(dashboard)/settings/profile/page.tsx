export default function ProfileSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-foreground">Profile</h2>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and connected wallet.
        </p>
      </div>

      <div className="p-6 bg-card rounded-lg border border-border">
        <h3 className="text-sm font-medium text-foreground">Connected Wallet</h3>
        <p className="mt-2 text-sm text-muted-foreground font-mono">
          Not connected
        </p>
        <button className="mt-4 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-light">
          Connect Wallet
        </button>
      </div>
    </div>
  );
}
