export default function AppearanceSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-foreground">Appearance</h2>
        <p className="text-sm text-muted-foreground">
          Customize the look and feel of your dashboard.
        </p>
      </div>

      <div className="p-6 bg-card rounded-lg border border-border">
        <h3 className="text-sm font-medium text-foreground">Theme</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose your preferred color scheme.
        </p>
        <div className="mt-4 flex gap-4">
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-primary bg-background">
            <div className="w-12 h-8 rounded bg-zinc-900" />
            <span className="text-xs text-foreground">Dark</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-background opacity-50 cursor-not-allowed">
            <div className="w-12 h-8 rounded bg-white border" />
            <span className="text-xs text-muted-foreground">Light (Soon)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
