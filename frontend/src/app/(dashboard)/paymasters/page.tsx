export default function PaymastersPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Paymasters</h1>
        <button className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-light">
          + New Paymaster
        </button>
      </div>

      {/* Paymaster list will be added here */}
      <div className="mt-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
            <span className="text-2xl">💳</span>
          </div>
          <h2 className="text-lg font-medium text-foreground">
            No Paymasters Yet
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Create your first Paymaster to start sponsoring gas fees for your
            users.
          </p>
        </div>
      </div>
    </div>
  );
}
