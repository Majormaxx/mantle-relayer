import { PaymasterDetailClient } from '@/components/paymaster/PaymasterDetailClient';

interface PaymasterDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PaymasterDetailPage({
  params,
}: PaymasterDetailPageProps) {
  const { id } = await params;

  return <PaymasterDetailClient paymasterId={id} />;
}
