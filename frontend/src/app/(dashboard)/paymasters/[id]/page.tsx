interface PaymasterDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PaymasterDetailPage({
  params,
}: PaymasterDetailPageProps) {
  const { id } = await params;

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <a href="/paymasters" className="hover:text-foreground">
          ← Back to Paymasters
        </a>
      </div>

      <h1 className="text-2xl font-bold text-foreground">Paymaster Details</h1>
      <p className="mt-2 text-sm text-muted-foreground font-mono">{id}</p>

      {/* Paymaster details tabs will be added here */}
    </div>
  );
}
