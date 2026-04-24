'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { authStorage } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await api.login(email, password);
      authStorage.setAccessToken(result.tokens.accessToken);
      authStorage.setRefreshToken(result.tokens.refreshToken);
      authStorage.setUser(result.user);
      router.replace('/portal');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Не удалось выполнить вход');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card stack">
        <div>
          <div className="eyebrow">Клиентская сторона</div>
          <h1 className="auth-title">Вход в AquaSense Portal</h1>
          <p className="muted">Просматривайте озёра, карту, паспорт водоёма и все доступные измерения.</p>
        </div>

        <form className="stack" onSubmit={handleSubmit}>
          <label className="uproblem-field">
            <span>Email</span>
            <input
              className="uproblem-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите email"
              autoComplete="email"
              required
            />
          </label>

          <label className="uproblem-field">
            <span>Пароль</span>
            <input
              className="uproblem-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              autoComplete="current-password"
              required
            />
          </label>

          {error ? <div className="error-box">{error}</div> : null}

          <button className="uproblem-button" type="submit" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <p className="muted small-text">
          Нет аккаунта? <Link href="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}
