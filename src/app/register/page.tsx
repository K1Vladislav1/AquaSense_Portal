'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { authStorage } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await api.register(login, email, password);
      authStorage.setAccessToken(result.tokens.accessToken);
      authStorage.setRefreshToken(result.tokens.refreshToken);
      authStorage.setUser(result.user);
      router.replace('/portal');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Не удалось создать аккаунт');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card stack">
        <div>
          <div className="eyebrow">Новый клиент</div>
          <h1 className="auth-title">Регистрация</h1>
          <p className="muted">Создайте аккаунт клиента, чтобы воспользоватся всем функционалом портала.</p>
        </div>

        <form className="stack" onSubmit={handleSubmit}>
          <label className="uproblem-field">
            <span>Логин</span>
            <input
              className="uproblem-input"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Введите логин"
              required
            />
          </label>

          <label className="uproblem-field">
            <span>Email</span>
            <input
              className="uproblem-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите email"
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
              required
            />
          </label>

          <label className="uproblem-field">
            <span>Повторите пароль</span>
            <input
              className="uproblem-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Повторите пароль"
              required
            />
          </label>

          {error ? <div className="error-box">{error}</div> : null}

          <button className="uproblem-button" type="submit" disabled={loading}>
            {loading ? 'Создание...' : 'Создать аккаунт'}
          </button>
        </form>

        <p className="muted small-text">
          Уже есть аккаунт? <Link href="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
}
