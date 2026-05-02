'use client';

import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { ProtectedShell } from '@/components/ProtectedShell';
import { api } from '@/lib/api';
import type { CreateProblemDto, ProblemSeverity, WaterBody, WaterProblem, } from '@/types';

type ProblemFormState = {
  waterBodyId: string;
  title: string;
  description: string;
  severity: ProblemSeverity;
};

const MESSAGES_PAGE_SIZE = 5;

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
  const [currentPage, setCurrentPage] = useState(1);

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
        setCurrentPage(1);

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

  const history = useMemo(() => {
    return myProblems
      .filter((problem) => problem.status === 'APPROVED')
      .sort((a, b) => {
        const aTime = new Date(a.createdAt || '').getTime();
        const bTime = new Date(b.createdAt || '').getTime();
        return bTime - aTime;
      });
  }, [myProblems]);

  useEffect(() => {
    setCurrentPage(1);
  }, [history.length]);

  const totalPages = useMemo(() => {
    if (!history.length) {
      return 1;
    }

    return Math.ceil(history.length / MESSAGES_PAGE_SIZE);
  }, [history]);

  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * MESSAGES_PAGE_SIZE;
    const endIndex = startIndex + MESSAGES_PAGE_SIZE;
    return history.slice(startIndex, endIndex);
  }, [history, currentPage]);

  const visiblePages = useMemo(() => {
    const pages: number[] = [];

    let start = currentPage - 2;
    let end = currentPage + 2;

    if (start < 1) {
      start = 1;
      end = Math.min(5, totalPages);
    }

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, totalPages - 4);
    }

    let page = start;
    while (page <= end) {
      pages.push(page);
      page += 1;
    }

    return pages;
  }, [currentPage, totalPages]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

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
               Опишите проблему максимально подробно для быстрой проверки и решения проблемы.
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
              <h2 className="uproblem-title">История сообщений</h2>
              <p className="uproblem-text">
                Здесь отображаются только одобренные сообщения.
              </p>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="uproblem-empty">Пока нет одобренных сообщений</div>
          ) : (
            <>
              <div className="uproblem-history">
                {paginatedHistory.map((problem) => (
                  <article key={problem.id} className="uproblem-history-card">
                    <div className="uproblem-history-top">
                      <h3 className="uproblem-history-title">{problem.title}</h3>

                      <div className="uproblem-history-tags">
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
                        <strong>Водоём:</strong> {problem.waterBody?.name || problem.waterBodyId || '—'}
                      </span>
                    </div>
                  </article>
                ))}
              </div>

              <div className="pagination">
                <button
                  type="button"
                  className="pagination__button"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  Назад
                </button>

                <div className="pagination__pages">
                  {visiblePages.map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={`pagination__page ${
                        currentPage === page ? 'pagination__page--active' : ''
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="pagination__button"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Вперёд
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </ProtectedShell>
  );
}

