export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="container flex flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-xl font-bold text-primary-foreground">M</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Mantle <span className="text-primary">Relayer</span>
          </h1>
        </div>

        {/* Hero Text */}
        <div className="max-w-2xl space-y-4">
          <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Let Your Users Transact{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Without Gas
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Deploy Paymasters to sponsor gas for your users on Mantle. Simple SDK, complete control,
            real-time analytics.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <button className="rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground transition-all hover:bg-primary-light hover:shadow-lg hover:shadow-primary/25">
            Get Started Free
          </button>
          <button className="rounded-lg border border-border bg-transparent px-8 py-3 font-semibold text-foreground transition-all hover:bg-muted">
            View Documentation
          </button>
        </div>

        {/* Trust Text */}
        <p className="text-sm text-muted-foreground">
          Free on testnet • No credit card required
        </p>

        {/* Status Indicator */}
        <div className="mt-8 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
          <span className="text-sm text-muted-foreground">
            Project setup complete • Ready to build
          </span>
        </div>
      </div>
    </main>
  );
}
