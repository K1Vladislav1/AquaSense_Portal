import Link from 'next/link';
import { ProtectedShell } from '@/components/ProtectedShell';
import { PageHeader } from '@/components/PageHeader';
import { WaterBodyDashboard } from '@/components/WaterBodyDashboard';

export default async function WaterBodyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ProtectedShell>
      <div className="stack">
        <PageHeader
          title="Дашборд водоёма"
          description="Паспорт, таблица записей и график по выбранному году и параметру."
          action={
            <Link className="btn secondary" href="/water-bodies">
              Назад к карте
            </Link>
          }
        />
        <WaterBodyDashboard id={id} />
      </div>
    </ProtectedShell>
  );
}