import Link from 'next/link';
import { ProtectedShell } from '@/components/ProtectedShell';
import { PageHeader } from '@/components/PageHeader';
import { KpiCard } from '@/components/KpiCard';

export default function PortalPage() {
  return (
    <ProtectedShell>
      <div className="stack">

        {/* Главный блок */}
        <PageHeader
          title="Добро пожаловать в AquaSense"
          description="Система мониторинга качества воды в озёрах. Получайте актуальную информацию о состоянии водоёмов и анализируйте данные по параметрам воды."
          action={
            <Link className="btn" href="/water-bodies">
              Перейти к карте
            </Link>
          }
        />

        {/* Быстрые действия */}
        <section className="grid cards-3">
          <KpiCard
            title="Открыть карту"
            value="Озёра"
            hint="Выберите водоём на карте"
          />
          <KpiCard
            title="Посмотреть аналитику"
            value="Графики"
            hint="Данные по параметрам воды"
          />
          <KpiCard
            title="Мой профиль"
            value="Аккаунт"
            hint="Личная информация"
          />
        </section>

        {/* Инструкция */}
        <section className="card stack">
          <h2 className="section-title">Как пользоваться системой</h2>

          <div className="details-grid">

            <div>
              <div className="landing-step-card__number">01</div>
              <strong> Перейдите на карту</strong>
              <p>Нажмите кнопку «Перейти к карте» и откройте список озёр.</p>
            </div>

            <div>
              <div className="landing-step-card__number">02</div>
              <strong> Выберите озеро</strong>
              <p>Кликните по маркеру или выберите водоём из списка.</p>
            </div>

            <div>
              <div className="landing-step-card__number">03</div>
              <strong> Изучите данные</strong>
              <p>Просмотрите показатели воды и состояние озера.</p>
            </div>

            <div>
              <div className="landing-step-card__number">04</div>
              <strong> Используйте фильтры</strong>
              <p>Выберите год и параметр для анализа.</p>
            </div>

          </div>
        </section>

        {/* 💡 Подсказка */}
        <section className="card">
          <h2 className="section-title">Подсказка</h2>
          <p className="muted">
            Для начала работы откройте карту и выберите любое озеро.
            Это основной сценарий использования системы.
          </p>
        </section>

      </div>
    </ProtectedShell>
  );
}