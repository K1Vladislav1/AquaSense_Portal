'use client';

import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { ProtectedShell } from '@/components/ProtectedShell';
import { api } from '@/lib/api';
import type {
  CreateProblemDto,
  ProblemSeverity,
  WaterBody,
  WaterProblem,
} from '@/types';

type ProblemFormState = {
  waterBodyId: string;
  title: string;
  description: string;
  severity: ProblemSeverity;
};

const severityOptions: Array<{ value: ProblemSeverity; label: string }> = [
  { value: 'LOW', label: 'Низкая' },
  { value: 'MEDIUM', label: 'Средняя' },
  { value: 'HIGH', label: 'Высокая' },
];

function isSameDay(dateA: Date, dateB: Date) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function formatDate(value?: string) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getSeverityLabel(value: ProblemSeverity) {
  if (value === 'LOW') {
    return 'Низкая';
  }

  if (value === 'MEDIUM') {
    return 'Средняя';
  }

  return 'Высокая';
}

export default function ReportProblemPage() {
  const [waterBodies, setWaterBodies] = useState<WaterBody[]>([]);
  const [myProblems, setMyProblems] = useState<WaterProblem[]>([]);

  const [form, setForm] = useState<ProblemFormState>({
    waterBodyId: '',
    title: '',
    description: '',
    severity: 'MEDIUM',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;

    async function loadPage() {
      try {
        setLoading(true);
        setError('');

        const [waterBodiesData, myProblemsData] = await Promise.all([
          api.getWaterBodies(),
          api.getMyProblems(),
        ]);

        if (!active) {
          return;
        }

        const safeWaterBodies = Array.isArray(waterBodiesData) ? waterBodiesData : [];
        const safeProblems = Array.isArray(myProblemsData) ? myProblemsData : [];

        setWaterBodies(safeWaterBodies);
        setMyProblems(safeProblems);

        setForm((prev) => ({
          ...prev,
          waterBodyId: prev.waterBodyId || safeWaterBodies[0]?.id || '',
        }));
      } catch (err: unknown) {
        if (!active) {
          return;
        }

        setError(err instanceof Error ? err.message : 'Не удалось загрузить страницу');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadPage();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!success) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSuccess('');
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [success]);

  const alreadyCreatedToday = useMemo(() => {
    const today = new Date();

    return myProblems.some((problem) => {
      if (!problem.createdAt) {
        return false;
      }

      const createdAt = new Date(problem.createdAt);

      if (Number.isNaN(createdAt.getTime())) {
        return false;
      }

      return isSameDay(createdAt, today);
    });
  }, [myProblems]);

  const approvedHistory = useMemo(() => {
    return myProblems
      .filter((problem) => problem.status === 'APPROVED')
      .sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return bTime - aTime;
      });
  }, [myProblems]);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError('');
    }

    if (success) {
      setSuccess('');
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (alreadyCreatedToday) {
      setError('Можно отправить только одну проблему в день');
      return;
    }

    if (!form.waterBodyId || !form.title.trim() || !form.description.trim()) {
      setError('Заполните водоём, название и описание проблемы');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload: CreateProblemDto = {
        waterBodyId: form.waterBodyId,
        title: form.title.trim(),
        description: form.description.trim(),
        severity: form.severity,
      };

      const createdProblem = await api.createProblem(payload);

      setSuccess('Проблема успешно отправлена');

      setMyProblems((prev) => [createdProblem, ...prev]);

      setForm((prev) => ({
        ...prev,
        title: '',
        description: '',
        severity: 'MEDIUM',
      }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Не удалось отправить проблему');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProtectedShell>
      <div className="uproblem-page">
        <PageHeader
          title="Сообщить о проблеме"
          description="Здесь можно отправить сообщение о загрязнении или другой проблеме по водоёму."
        />

        <section className="uproblem-card">
          <div className="uproblem-head">
            <div>
              <h2 className="uproblem-title">Форма обращения</h2>
              <p className="uproblem-text">
                Опишите проблему максимально понятно, чтобы её было проще проверить.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="uproblem-empty">Загружаем список водоёмов...</div>
          ) : null}

          {alreadyCreatedToday && !loading ? (
            <div className="uproblem-warning">
              Сегодня вы уже отправляли сообщение. Новую проблему можно создать завтра.
            </div>
          ) : null}

          {error ? <div className="uproblem-error">{error}</div> : null}
          {success ? <div className="uproblem-success">{success}</div> : null}

          <form className="uproblem-form" onSubmit={handleSubmit}>
            <div className="uproblem-grid">
              <label className="uproblem-field">
                <span className="uproblem-label">Водоём</span>
                <select
                  className="uproblem-input"
                  name="waterBodyId"
                  value={form.waterBodyId}
                  onChange={handleChange}
                  disabled={loading || waterBodies.length === 0 || alreadyCreatedToday}
                >
                  {waterBodies.length === 0 ? (
                    <option value="">Нет доступных водоёмов</option>
                  ) : null}

                  {waterBodies.map((waterBody) => (
                    <option key={waterBody.id} value={waterBody.id}>
                      {waterBody.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="uproblem-field">
                <span className="uproblem-label">Серьёзность</span>
                <select
                  className="uproblem-input"
                  name="severity"
                  value={form.severity}
                  onChange={handleChange}
                  disabled={alreadyCreatedToday}
                >
                  {severityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="uproblem-field uproblem-field--wide">
                <span className="uproblem-label">Название проблемы</span>
                <input
                  className="uproblem-input"
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Например: мутная вода и неприятный запах"
                  disabled={alreadyCreatedToday}
                />
              </label>

              <label className="uproblem-field uproblem-field--wide">
                <span className="uproblem-label">Описание</span>
                <textarea
                  className="uproblem-input uproblem-textarea"
                  name="description"
                  rows={7}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Опишите, что именно вы заметили: мусор, запах, пену, изменение цвета воды, водоросли, мёртвую рыбу и другие признаки."
                  disabled={alreadyCreatedToday}
                />
              </label>
            </div>

            <div className="uproblem-actions">
              <button
                className="uproblem-button"
                type="submit"
                disabled={saving || loading || waterBodies.length === 0 || alreadyCreatedToday}
              >
                {saving ? 'Отправка...' : 'Отправить сообщение'}
              </button>
            </div>
          </form>
        </section>

        <section className="uproblem-card">
          <div className="uproblem-head">
            <div>
              <h2 className="uproblem-title">История одобренных сообщений</h2>
              <p className="uproblem-text">
                Здесь отображаются только те сообщения, которые были одобрены администраторами. Они уже находятся в работе и скоро будут проверены на месте.
              </p>
            </div>
          </div>

          {approvedHistory.length === 0 ? (
            <div className="uproblem-empty">
              Пока нет сообщений со статусом «Одобрено»
            </div>
          ) : (
            <div className="uproblem-history">
              {approvedHistory.map((problem) => (
                <article key={problem.id} className="uproblem-history-card">
                  <div className="uproblem-history-top">
                    <h3 className="uproblem-history-title">{problem.title}</h3>

                    <div className="uproblem-history-tags">
                      <span className="uproblem-badge uproblem-badge--approved">
                        Одобрено
                      </span>
                      <span className="uproblem-badge uproblem-badge--severity">
                        {getSeverityLabel(problem.severity)}
                      </span>
                    </div>
                  </div>

                  <p className="uproblem-history-desc">{problem.description}</p>

                  <div className="uproblem-history-meta">
                    <span>
                      <strong>Дата:</strong> {formatDate(problem.createdAt)}
                    </span>

                    <span>
                      <strong>Водоём:</strong>{' '}
                      {problem.waterBody?.name || problem.waterBodyId || '—'}
                    </span>
                  </div>

                  {problem.moderationNote ? (
                    <div className="uproblem-history-note">
                      <strong>Комментарий администратора:</strong> {problem.moderationNote}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </ProtectedShell>
  );
}