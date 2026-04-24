import { ProtectedShell } from '@/components/ProtectedShell';
import { PageHeader } from '@/components/PageHeader';
import { WaterBodiesExplorer } from '@/components/WaterBodiesExplorer';

export default function WaterBodiesPage() {
  return (
    <ProtectedShell>
      <div className="stack">
        <PageHeader
          title="Озёра"
          description="Поиск и просмотр водоёмов Северо-Казахстанской области на карте."
        />
        <WaterBodiesExplorer />
      </div>
    </ProtectedShell>
  );
}