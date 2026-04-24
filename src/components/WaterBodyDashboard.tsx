'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api } from '@/lib/api';
import {
  Measurement,
  MetricOption,
  NumericMeasurementKey,
  WaterBody,
} from '@/types';
import { formatDate, formatNumber } from '@/utils/format';
import { KpiCard } from './KpiCard';

const metricOptions: MetricOption[] = [
  { key: 'ph', label: 'pH' },
  { key: 'turbidity', label: 'Мутность' },
  { key: 'permanganateOxid', label: 'Перманганатная окисляемость' },
  { key: 'mineralization', label: 'Минерализация' },
  { key: 'salinity', label: 'Солёность' },
  { key: 'hardness', label: 'Жёсткость' },
  { key: 'calcium', label: 'Кальций' },
  { key: 'magnesium', label: 'Магний' },
  { key: 'chlorides', label: 'Хлориды' },
  { key: 'sulfates', label: 'Сульфаты' },
  { key: 'hydrocarbonates', label: 'Гидрокарбонаты' },
  { key: 'potassiumSodium', label: 'Калий/Натрий' },
  { key: 'overgrowthPercent', label: 'Зарастание, %', unit: '%' },
];

const RECORDS_PER_PAGE = 15;

function getNumericValue(
  measurement: Measurement,
  key: NumericMeasurementKey,
): number | null {
  const value = measurement[key];
  return typeof value === 'number' && !Number.isNaN(value) ? value : null;
}

export function WaterBodyDashboard({ id }: { id: string }) {
  const [waterBody, setWaterBody] = useState<WaterBody | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedMetric, setSelectedMetric] =
    useState<NumericMeasurementKey>('ph');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError('');

    void Promise.all([api.getWaterBodyById(id), api.getWaterBodyMeasurements(id)])
      .then(([body, bodyMeasurements]) => {
        setWaterBody(body);

        const sorted = [...bodyMeasurements].sort((a, b) => {
          const left = a.recordDate ? new Date(a.recordDate).getTime() : 0;
          const right = b.recordDate ? new Date(b.recordDate).getTime() : 0;
          return left - right;
        });

        setMeasurements(sorted);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? err.message
            : 'Не удалось загрузить данные водоёма',
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  const availableYears = useMemo(() => {
    const years = Array.from(
      new Set(
        measurements
          .map((item) =>
            item.recordDate ? new Date(item.recordDate).getFullYear() : null,
          )
          .filter(
            (year): year is number =>
              typeof year === 'number' && !Number.isNaN(year),
          ),
      ),
    ).sort((a, b) => b - a);

    return years;
  }, [measurements]);

  const filteredMeasurements = useMemo(() => {
    return measurements.filter((item) => {
      if (selectedYear === 'all') {
        return true;
      }

      if (!item.recordDate) {
        return false;
      }

      return String(new Date(item.recordDate).getFullYear()) === selectedYear;
    });
  }, [measurements, selectedYear]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear, id]);

  const totalPages = useMemo(() => {
    if (!filteredMeasurements.length) {
      return 1;
    }

    return Math.ceil(filteredMeasurements.length / RECORDS_PER_PAGE);
  }, [filteredMeasurements]);

  const paginatedMeasurements = useMemo(() => {
    const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
    const endIndex = startIndex + RECORDS_PER_PAGE;
    return filteredMeasurements.slice(startIndex, endIndex);
  }, [filteredMeasurements, currentPage]);

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

  const chartMetric =
    metricOptions.find((metric) => metric.key === selectedMetric) ||
    metricOptions[0];

  const chartData = useMemo(() => {
    return filteredMeasurements
      .map((item) => ({
        id: item.id,
        date: formatDate(item.recordDate),
        isoDate: item.recordDate || '',
        value: getNumericValue(item, selectedMetric),
      }))
      .filter((item) => item.value != null);
  }, [filteredMeasurements, selectedMetric]);

  const latestMeasurement = measurements[measurements.length - 1] || null;

  const formatAreaKm2 = (value?: number | null) => {
    if (value == null || Number.isNaN(value)) {
      return '—';
    }

    return (value / 100).toLocaleString('ru-RU', {
      maximumFractionDigits: 2,
    });
  };

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

  if (loading) {
    return <div className="card">Загрузка дашборда...</div>;
  }

  if (error) {
    return <div className="card">{error}</div>;
  }

  if (!waterBody) {
    return <div className="card">Водоём не найден.</div>;
  }

  return (
    <div className="stack">
      <section className="card stack">
        <div className="page-header align-start">
          <div>
            <h2 className="section-title">{waterBody.name}</h2>
            <p className="page-description">
              Полная карточка водоёма и графики по всем записям за выбранный год.
            </p>
          </div>
          <span className="badge">{waterBody.district || 'Без района'}</span>
        </div>

        <div className="grid cards-3">
          <KpiCard title="Всего измерений" value={measurements.length} />
          <KpiCard
            title="Последняя запись"
            value={
              latestMeasurement?.recordDate
                ? formatDate(latestMeasurement.recordDate)
                : '—'
            }
          />
          <KpiCard title="Доступных годов" value={availableYears.length} />
        </div>
      </section>

      <section className="card stack">
        <h3>Паспорт водоёма</h3>
        <div className="details-grid">
          <div>
            <strong>Район:</strong> {waterBody.district || '—'}
          </div>
          <div>
            <strong>Широта:</strong> {waterBody.latitude ?? '—'}
          </div>
          <div>
            <strong>Долгота:</strong> {waterBody.longitude ?? '—'}
          </div>

          <div>
            <strong>Площадь (кв. км):</strong>{' '}
            {formatAreaKm2(waterBody.passport?.area)}
          </div>
          <div>
            <strong>Площадь зарастания (кв. км):</strong>{' '}
            {formatAreaKm2(waterBody.passport?.overgrowthArea)}
          </div>
          <div>
            <strong>Высота (м):</strong>{' '}
            {formatNumber(waterBody.passport?.altitude)}
          </div>
          <div>
            <strong>Длина (км):</strong>{' '}
            {formatNumber(waterBody.passport?.length)}
          </div>
          <div>
            <strong>Макс. ширина (км):</strong>{' '}
            {formatNumber(waterBody.passport?.maxWidth)}
          </div>
          <div>
            <strong>Длина береговой линии (км):</strong>{' '}
            {formatNumber(waterBody.passport?.coastlineLength)}
          </div>
          <div>
            <strong>Развитие береговой линии:</strong>{' '}
            {formatNumber(waterBody.passport?.coastlineDev)}
          </div>
          <div>
            <strong>Водосборная площадь (кв. км):</strong>{' '}
            {formatNumber(waterBody.passport?.catchmentArea)}
          </div>
          <div>
            <strong>Текущая глубина (м):</strong>{' '}
            {formatNumber(waterBody.passport?.currentDepth)}
          </div>
          <div>
            <strong>Макс. глубина (м):</strong>{' '}
            {formatNumber(waterBody.passport?.maxDepth)}
          </div>
          <div>
            <strong>Средняя глубина (м):</strong>{' '}
            {formatNumber(waterBody.passport?.avgDepth)}
          </div>
          <div>
            <strong>Объём (млн м³):</strong>{' '}
            {formatNumber(waterBody.passport?.volume)}
          </div>

          <div>
            <strong>Вид рыбного хозяйства:</strong>{' '}
            {waterBody.passport?.fisheryType || '—'}
          </div>
          <div>
            <strong>Рыбопродуктивность:</strong>{' '}
            {formatNumber(waterBody.passport?.fishProductivity)}
          </div>

          <div>
            <strong>Ихтиофауна:</strong> {waterBody.passport?.ichthyofauna || '—'}
          </div>
          <div>
            <strong>Млекопитающие:</strong> {waterBody.passport?.mammals || '—'}
          </div>
          <div>
            <strong>Беспозвоночные:</strong>{' '}
            {waterBody.passport?.invertebrates || '—'}
          </div>
          <div>
            <strong>Хоз. описание:</strong>{' '}
            {waterBody.passport?.economicDesc || '—'}
          </div>
        </div>
      </section>

      <section className="card stack">
        <h3>График измерений</h3>
        <div className="filters-row">
          <label className="field">
            <span>Год</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="all">Все годы</option>
              {availableYears.map((year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Параметр</span>
            <select
              value={selectedMetric}
              onChange={(e) =>
                setSelectedMetric(e.target.value as NumericMeasurementKey)
              }
            >
              {metricOptions.map((metric) => (
                <option key={metric.key} value={metric.key}>
                  {metric.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <p className="muted">
            На графике показаны все записи по выбранному параметру за выбранный период.
          </p>
        </div>

        {chartData.length ? (
          <div className="chart-box">
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" minTickGap={24} />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [
                    `${value}${chartMetric.unit ? ` ${chartMetric.unit}` : ''}`,
                    chartMetric.label,
                  ]}
                  labelFormatter={(label: string) => `Дата: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#1f6feb"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="empty-state">
            Для выбранных фильтров нет числовых данных.
          </div>
        )}
      </section>

      <section className="card stack">
        <div className="water-records-header">
          <h3>Все записи</h3>
          <span className="muted">
            Показано {paginatedMeasurements.length} из {filteredMeasurements.length}
          </span>
        </div>

        <div className="table-wrap water-table-desktop">
          <table className="table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>pH</th>
                <th>Мутность</th>
                <th>Минерализация</th>
                <th>Солёность</th>
                <th>Жёсткость</th>
                <th>Зарастание %</th>
                <th>Трофический статус</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMeasurements.map((item) => (
                <tr key={item.id}>
                  <td>{formatDate(item.recordDate)}</td>
                  <td>{formatNumber(item.ph)}</td>
                  <td>{formatNumber(item.turbidity)}</td>
                  <td>{formatNumber(item.mineralization)}</td>
                  <td>{formatNumber(item.salinity)}</td>
                  <td>{formatNumber(item.hardness)}</td>
                  <td>{formatNumber(item.overgrowthPercent)}</td>
                  <td>{item.trophicStatus || '—'}</td>
                </tr>
              ))}

              {!paginatedMeasurements.length ? (
                <tr>
                  <td colSpan={8}>Записи отсутствуют.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="water-mobile-records">
          {paginatedMeasurements.length ? (
            paginatedMeasurements.map((item) => (
              <div key={item.id} className="water-mobile-record">
                <div className="water-mobile-record__date">
                  {formatDate(item.recordDate)}
                </div>

                <div className="water-mobile-record__grid">
                  <div className="water-mobile-record__item">
                    <span className="water-mobile-record__label">pH</span>
                    <span className="water-mobile-record__value">
                      {formatNumber(item.ph)}
                    </span>
                  </div>

                  <div className="water-mobile-record__item">
                    <span className="water-mobile-record__label">Мутность</span>
                    <span className="water-mobile-record__value">
                      {formatNumber(item.turbidity)}
                    </span>
                  </div>

                  <div className="water-mobile-record__item">
                    <span className="water-mobile-record__label">
                      Минерализация
                    </span>
                    <span className="water-mobile-record__value">
                      {formatNumber(item.mineralization)}
                    </span>
                  </div>

                  <div className="water-mobile-record__item">
                    <span className="water-mobile-record__label">Солёность</span>
                    <span className="water-mobile-record__value">
                      {formatNumber(item.salinity)}
                    </span>
                  </div>

                  <div className="water-mobile-record__item">
                    <span className="water-mobile-record__label">Жёсткость</span>
                    <span className="water-mobile-record__value">
                      {formatNumber(item.hardness)}
                    </span>
                  </div>

                  <div className="water-mobile-record__item">
                    <span className="water-mobile-record__label">
                      Зарастание %
                    </span>
                    <span className="water-mobile-record__value">
                      {formatNumber(item.overgrowthPercent)}
                    </span>
                  </div>

                  <div className="water-mobile-record__item water-mobile-record__item--full">
                    <span className="water-mobile-record__label">
                      Трофический статус
                    </span>
                    <span className="water-mobile-record__value">
                      {item.trophicStatus || '—'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">Записи отсутствуют.</div>
          )}
        </div>

        {filteredMeasurements.length > 0 && (
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
        )}
      </section>
    </div>
  );
}