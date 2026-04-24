'use client';

import Link from 'next/link';
import { useState } from 'react';
import imantau from '@/app/images/lakes/imantau.jpeg';

const features = [
  {
    title: 'Интерактивная карта озёр',
    text: 'Поиск озёр и быстрый переход к данным.',
  },
  {
    title: 'Статистика и графики',
    text: 'Просмотр ключевых показателей воды.',
  },
  {
    title: 'Паспорт водоёма',
    text: 'Площадь, глубина и основные характеристики.',
  },
  {
    title: 'ИИ-анализ состояния озёр',
    text: 'Наглядная оценка состояния воды.',
  },
  {
    title: 'Сообщения о проблемах',
    text: 'Отправка обращений по экологическим вопросам.',
  },
  {
    title: 'Личный кабинет',
    text: 'Работа с профилем и функциями портала.',
  },
];

const benefits = [
  'Карта, аналитика и мониторинг в одном месте',
  'Наглядные данные по каждому озеру',
  'Быстрый доступ к статистике',
  'Отправка экологических обращений',
  'Интеграция ИИ-анализа',
  'Удобная работа через личный кабинет',
];

const steps = [
  {
    number: '01',
    title: 'Зарегистрируйтесь',
    text: 'Создайте аккаунт для доступа к системе.',
  },
  {
    number: '02',
    title: 'Выберите озеро',
    text: 'Найдите водоём на карте или в списке.',
  },
  {
    number: '03',
    title: 'Изучите данные',
    text: 'Просмотрите характеристики и статистику.',
  },
  {
    number: '04',
    title: 'Используйте портал',
    text: 'Работайте с ИИ и обращениями.',
  },
];

export default function LandingPortalPage() {
  const [burgerOpen, setBurgerOpen] = useState(false);

  const closeMenu = () => setBurgerOpen(false);

  return (
    <div className="landing-root">
      <header className="landing-header">
        <div className="landing-container">
          <div className="landing-header__inner">
            <Link href="/" className="landing-logo" onClick={closeMenu}>
              <div className="landing-logo__icon">A</div>
              <div className="landing-logo__text">
                <strong>AquaSense Portal</strong>
                <span>Мониторинг озёр Северного Казахстана</span>
              </div>
            </Link>

            <nav className="landing-nav">
              <a href="#hero" className="landing-nav__link">
                Главная
              </a>
              <a href="#features" className="landing-nav__link">
                Возможности
              </a>
              <a href="#workflow" className="landing-nav__link">
                Как работает
              </a>
              <a href="#final" className="landing-nav__link">
                  Начать
              </a>
            </nav>

            <div className="landing-header__actions">
              <Link href="/login" className="landing-btn landing-btn--secondary">
                Войти
              </Link>
              <Link href="/register" className="landing-btn landing-btn--primary">
                Регистрация
              </Link>
            </div>

            <button
              type="button"
              className="landing-burger"
              onClick={() => setBurgerOpen((prev) => !prev)}
              aria-label="Открыть меню"
            >
              {burgerOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {burgerOpen ? (
          <div className="landing-mobile-menu">
            <div className="landing-container">
              <div className="landing-mobile-menu__inner">
                <a href="#hero" onClick={closeMenu} className="landing-mobile-menu__link">
                  Главная
                </a>
                <a href="#features" onClick={closeMenu} className="landing-mobile-menu__link">
                  Возможности
                </a>
                <a href="#workflow" onClick={closeMenu} className="landing-mobile-menu__link">
                  Как работает
                </a>
                <a href="#final" onClick={closeMenu} className="landing-mobile-menu__link">
                  Начать
                </a>

                <div className="landing-mobile-menu__actions">
                  <Link href="/login" className="landing-btn landing-btn--secondary" onClick={closeMenu}>
                    Войти
                  </Link>
                  <Link href="/register" className="landing-btn landing-btn--primary" onClick={closeMenu}>
                    Регистрация
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <main className="landing-main">
        <section id="hero" className="landing-hero">
          <div className="landing-container">
            <div className="landing-hero__grid">
              <div className="landing-hero__content">
                <div className="landing-badge">Экологический портал</div>

                <h1 className="landing-hero__title">
                  Платформа для мониторинга озёр и анализа водных данных
                </h1>

                <p className="landing-hero__text">
                  Мониторинг воды, аналитика и удобный доступ к данным в одном интерфейсе.
                </p>

                <div className="landing-hero__actions">
                  <Link href="/login" className="landing-btn landing-btn--primary landing-btn--large">
                    Войти в портал
                  </Link>
                  <Link href="/register" className="landing-btn landing-btn--secondary landing-btn--large">
                    Создать аккаунт
                  </Link>
                </div>

                <div className="landing-hero__hint">
                  Получите доступ к данным озёр, аналитике и функциям системы.
                </div>
              </div>

              <div className="landing-hero__cards">
                <div className="landing-glass-card">
                  <div className="lake-card">
                    <img src={imantau.src} alt="Озеро Имантау" className="lake-card__image" />

                    <div className="lake-card__content">
                      <h3 className="lake-card__title">Имантау</h3>

                      <div className="lake-card__info">
                        <span> Айыртауский район</span>
                        <span> Площадь: 49 км²</span>
                        <span> Глубина: 5,7 м</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="landing-glass-card landing-glass-card--big">
                  <span className="landing-glass-card__eyebrow">Карта + аналитика</span>
                  <h3>Быстрый доступ к информации по каждому озеру</h3>
                  <p>От карты до статистики и характеристик водоёма.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="landing-section">
          <div className="landing-container">
            <div className="landing-section__heading">
              <span className="landing-section__eyebrow">Возможности портала</span>
              <h2>Функции, доступные пользователю</h2>
              <p>После входа открывается работа с данными, аналитикой и функциями портала.</p>
            </div>

            <div className="landing-feature-grid">
              {features.map((feature) => (
                <article key={feature.title} className="landing-feature-card">
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="landing-section landing-section--soft">
          <div className="landing-container">
            <div className="landing-section__heading">
              <span className="landing-section__eyebrow">Как работает портал</span>
              <h2>Путь пользователя от входа до анализа данных</h2>
              <p>Основные действия построены просто и понятно.</p>
            </div>

            <div className="landing-step-grid">
              {steps.map((step) => (
                <article key={step.number} className="landing-step-card">
                  <div className="landing-step-card__number">{step.number}</div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section id="final" className="landing-final">
        <div className="landing-container">
          <div className="landing-final__box landing-final__box--rich">
            <div className="landing-final__top">
              <h2>AquaSense Portal</h2>
              <p>
                Карта, показатели воды и краткая аналитика в одном удобном пространстве.
              </p>
            </div>

            <div className="landing-final__stats">
              <div className="landing-final__stat">
                <p><strong>Карта</strong>
                <span> быстрый переход к озеру</span></p>
              </div>

              <div className="landing-final__stat">
                <p><strong>Аналитика</strong>
                <span> понятные данные и графики</span></p>
              </div>

              <div className="landing-final__stat">
                <p><strong>ИИ-модуль</strong>
                <span> дополнительная оценка состояния воды</span></p>
              </div>
            </div>

            <div className="landing-hero__actions landing-hero__actions--center">
              <Link href="/login" className="landing-btn landing-btn--primary landing-btn--large">
                Войти в портал
              </Link>
              <Link href="/register" className="landing-btn landing-btn--secondary landing-btn--large">
                Создать аккаунт
              </Link>
            </div>
          </div>
        </div>
      </section>
  
      </main>

      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer__col">
            <div className="landing-logo landing-logo--footer">
              <div className="landing-logo__icon">A</div>
              <div className="landing-logo__text">
                <strong>AquaSense Portal</strong>
                <span>Мониторинг и аналитика озёр</span>
              </div>
            </div>

            <p className="landing-footer__text">
              Портал мониторинга озёр, статистики и анализа данных.
            </p>
          </div>

          <div className="landing-footer__col">
            <h3>Навигация</h3>
            <div className="landing-footer__links">
              <a href="#hero">Главная</a>
              <a href="#features">Возможности</a>
              <a href="#workflow">Как работает</a>
              <a href="#final">Начать</a>
            </div>
          </div>

          <div className="landing-footer__col">
            <h3>Действия</h3>
            <div className="landing-footer__links">
              <Link href="/login">Войти</Link>
              <Link href="/register">Регистрация</Link>
            </div>
          </div>

          <div className="landing-footer__bottom">
            <span>© 2026 AquaSense Portal. Все права защищены.</span>
            <div className="landing-footer__bottom-links">
              <Link href="/login">Войти</Link>
              <Link href="/register">Регистрация</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}