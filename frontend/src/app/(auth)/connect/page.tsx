export default function ConnectPage() {
  return (
    <div className="p-8 bg-card rounded-lg border border-border text-center">
      <h1 className="text-2xl font-bold text-foreground">Connect Wallet</h1>
      <p className="mt-2 text-muted-foreground">
        Connect your wallet to access the dashboard.
      </p>

      <button className="mt-6 w-full px-4 py-3 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-light">
        Connect Wallet
      </button>

      <p className="mt-4 text-xs text-muted-foreground">
        By connecting, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
