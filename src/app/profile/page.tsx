'use client';

import { useEffect, useState } from 'react';
import { ProtectedShell } from '@/components/ProtectedShell';
import { PageHeader } from '@/components/PageHeader';
import { UserAvatar } from '@/components/UserAvatar';
import { api } from '@/lib/api';
import type { ChangePasswordDto, UpdateProfileDto, User, WaterProblem } from '@/types';
import styles from './profile-page.module.css';

type ProfileFormState = {
  login: string;
  email: string;
  avatarUrl: string;
};

type PasswordFormState = {
  currentPassword: string;
  newPassword: string;
  repeatPassword: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [problems, setProblems] = useState<WaterProblem[]>([]);

  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    login: '',
    email: '',
    avatarUrl: '',
  });

  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    currentPassword: '',
    newPassword: '',
    repeatPassword: '',
  });

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    let active = true;

    async function loadPage() {
      try {
        setLoading(true);
        setProfileError('');

        const [profileData, problemsData] = await Promise.all([
          api.getProfile(),
          api.getMyProblems(),
        ]);

        if (!active) {
          return;
        }

        setUser(profileData);
        setProblems(Array.isArray(problemsData) ? problemsData : []);
        setProfileForm({
          login: profileData.login || '',
          email: profileData.email || '',
          avatarUrl: profileData.avatarUrl || '',
        });
      } catch (error: unknown) {
        if (!active) {
          return;
        }

        setProfileError(
          error instanceof Error ? error.message : 'Не удалось загрузить профиль'
        );
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
    if (!profileSuccess) {
      return;
    }

    const timer = window.setTimeout(() => {
      setProfileSuccess('');
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [profileSuccess]);

  useEffect(() => {
    if (!passwordSuccess) {
      return;
    }

    const timer = window.setTimeout(() => {
      setPasswordSuccess('');
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [passwordSuccess]);

  function handleProfileInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (profileError) {
      setProfileError('');
    }
  }

  function handlePasswordInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (passwordError) {
      setPasswordError('');
    }
  }

  async function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSavingProfile(true);
      setProfileError('');
      setProfileSuccess('');

      const payload: UpdateProfileDto = {
        login: profileForm.login,
        email: profileForm.email,
        avatarUrl: profileForm.avatarUrl,
      };

      const updatedUser = await api.updateProfile(payload);

      setUser(updatedUser);
      setProfileForm({
        login: updatedUser.login || '',
        email: updatedUser.email || '',
        avatarUrl: updatedUser.avatarUrl || '',
      });

      setProfileSuccess('Данные пользователя успешно обновлены');
    } catch (error: unknown) {
      setProfileError(
        error instanceof Error ? error.message : 'Не удалось сохранить данные'
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.repeatPassword
    ) {
      setPasswordError('Заполните все поля для смены пароля');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Новый пароль должен содержать минимум 6 символов');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.repeatPassword) {
      setPasswordError('Новый пароль и повтор пароля не совпадают');
      return;
    }

    try {
      setSavingPassword(true);
      setPasswordError('');
      setPasswordSuccess('');

      const payload: ChangePasswordDto = {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      };

      await api.changePassword(payload);

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        repeatPassword: '',
      });

      setPasswordSuccess('Пароль успешно изменён');
    } catch (error: unknown) {
      setPasswordError(
        error instanceof Error ? error.message : 'Не удалось изменить пароль'
      );
    } finally {
      setSavingPassword(false);
    }
  }

  function getStatusText(status: string) {
    if (status === 'PENDING') return 'На проверке';
    if (status === 'APPROVED') return 'Одобрено';
    if (status === 'REJECTED') return 'Отклонено';
    return status;
  }

  function getSeverityText(severity: string) {
    if (severity === 'LOW') return 'Низкая';
    if (severity === 'MEDIUM') return 'Средняя';
    if (severity === 'HIGH') return 'Высокая';
    return severity;
  }

  function getStatusBadgeClass(status: string) {
    if (status === 'APPROVED') return styles.badgeApproved;
    if (status === 'REJECTED') return styles.badgeRejected;
    if (status === 'PENDING') return styles.badgePending;
    return styles.badgeNeutral;
  }

  function getSeverityBadgeClass(severity: string) {
    if (severity === 'LOW') return styles.badgeSeverityLow;
    if (severity === 'MEDIUM') return styles.badgeSeverityMedium;
    if (severity === 'HIGH') return styles.badgeSeverityHigh;
    return styles.badgeNeutral;
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

  return (
    <ProtectedShell>
      <div className={styles.page}>
        <PageHeader
          title="Личный кабинет"
          description="Просмотр данных пользователя, редактирование профиля и список отправленных проблем."
        />

        {loading ? <div className={styles.box}>Загрузка профиля...</div> : null}

        {!loading && user ? (
          <>
            <section className={styles.layout}>
              <aside className={styles.left}>
                <div className={styles.box}>
                  <div className={styles.userTop}>
                    <div className={styles.avatarWrap}>
                      <UserAvatar
                        name={user.login || 'Пользователь'}
                        avatarUrl={user.avatarUrl}
                        size={96}
                      />
                    </div>

                    <div className={styles.userMeta}>
                      <h2 className={styles.userName}>{user.login || 'Пользователь'}</h2>
                      <p className={styles.userEmail}>{user.email || 'Email не указан'}</p>

                      <div className={styles.badges}>
                        <span className={`${styles.badge} ${styles.badgePending}`}>Пользователь</span>
                        <span className={`${styles.badge} ${styles.badgeSeverityHigh}`}>Проблем: {problems.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.infoList}>
                    <div className={styles.infoCard}>
                      <span className={styles.infoLabel}>Логин</span>
                      <span className={styles.infoValue}>{user.login || '—'}</span>
                    </div>

                    <div className={styles.infoCard}>
                      <span className={styles.infoLabel}>Email</span>
                      <span className={styles.infoValue}>{user.email || '—'}</span>
                    </div>

                    <div className={styles.infoCard}>
                      <span className={styles.infoLabel}>Аватар</span>
                      <span className={styles.infoValue}>
                        {user.avatarUrl ? 'Установлен' : 'Не установлен'}
                      </span>
                    </div>
                  </div>
                </div>
              </aside>

              <div className={styles.right}>
                <div className={styles.box}>
                  <div className={styles.sectionHead}>
                    <h3 className={styles.sectionTitle}>Редактирование данных</h3>
                    <p className={styles.sectionText}>
                        Здесь вы можете изменить свои данные и пароль.
                    </p>
                  </div>

                  {profileSuccess ? (
                    <div className={styles.successMessage}>{profileSuccess}</div>
                  ) : null}

                  {profileError ? (
                    <div className={styles.errorMessage}>{profileError}</div>
                  ) : null}

                  <form className={styles.form} onSubmit={handleProfileSubmit}>
                    <div className={styles.fields}>
                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="login">
                          Логин
                        </label>
                        <input
                          className={styles.input}
                          id="login"
                          name="login"
                          type="text"
                          value={profileForm.login}
                          onChange={handleProfileInputChange}
                          placeholder="Введите логин"
                        />
                      </div>

                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="email">
                          Email
                        </label>
                        <input
                          className={styles.input}
                          id="email"
                          name="email"
                          type="email"
                          value={profileForm.email}
                          onChange={handleProfileInputChange}
                          placeholder="Введите email"
                        />
                      </div>

                      <div className={`${styles.field} ${styles.fieldWide}`}>
                        <label className={styles.label} htmlFor="avatarUrl">
                          Ссылка на аватар
                        </label>
                        <input
                          className={styles.input}
                          id="avatarUrl"
                          name="avatarUrl"
                          type="text"
                          value={profileForm.avatarUrl}
                          onChange={handleProfileInputChange}
                          placeholder="https://example.com/avatar.jpg"
                        />
                      </div>
                    </div>

                    <div className={styles.actions}>
                      <button className={styles.button} type="submit" disabled={savingProfile}>
                        {savingProfile ? 'Сохранение...' : 'Сохранить данные'}
                      </button>
                    </div>
                  </form>

                  <div className={styles.divider} />

                  {passwordSuccess ? (
                    <div className={styles.successMessage}>{passwordSuccess}</div>
                  ) : null}

                  {passwordError ? (
                    <div className={styles.errorMessage}>{passwordError}</div>
                  ) : null}

                  <form className={styles.form} onSubmit={handlePasswordSubmit}>
                    <div className={styles.sectionHeadSmall}>
                      <h3 className={styles.sectionTitle}>Смена пароля</h3>
                    </div>

                    <div className={styles.fields}>
                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="currentPassword">
                          Старый пароль
                        </label>
                        <input
                          className={styles.input}
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordInputChange}
                          placeholder="Введите старый пароль"
                        />
                      </div>

                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="newPassword">
                          Новый пароль
                        </label>
                        <input
                          className={styles.input}
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordInputChange}
                          placeholder="Введите новый пароль"
                        />
                      </div>

                      <div className={`${styles.field} ${styles.fieldWide}`}>
                        <label className={styles.label} htmlFor="repeatPassword">
                          Повторите новый пароль
                        </label>
                        <input
                          className={styles.input}
                          id="repeatPassword"
                          name="repeatPassword"
                          type="password"
                          value={passwordForm.repeatPassword}
                          onChange={handlePasswordInputChange}
                          placeholder="Повторите новый пароль"
                        />
                      </div>
                    </div>

                    <div className={styles.actions}>
                      <button className={styles.button} type="submit" disabled={savingPassword}>
                        {savingPassword ? 'Сохранение...' : 'Изменить пароль'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </section>

            <section className={styles.box}>
              <div className={styles.sectionHead}>
                <h3 className={styles.sectionTitle}>Отправленные проблемы</h3>
                <p className={styles.sectionText}>
                  Здесь отображаются проблемы, которые пользователь уже отправлял
                </p>
              </div>

              {problems.length === 0 ? (
                <div className={styles.empty}>Проблемы пока не найдены</div>
              ) : (
                <div className={styles.problemList}>
                  {problems.map((problem) => (
                    <article key={problem.id} className={styles.problemCard}>
                      <div className={styles.problemTop}>
                        <h4 className={styles.problemTitle}>{problem.title}</h4>

                        <div className={styles.problemBadges}>
                          <span className={`${styles.badge} ${getStatusBadgeClass(problem.status)}`}>
                            {getStatusText(problem.status)}
                          </span>
                          <span className={`${styles.badge} ${getSeverityBadgeClass(problem.severity)}`}>
                            {getSeverityText(problem.severity)}
                          </span>
                        </div>
                      </div>

                      <p className={styles.problemDesc}>{problem.description}</p>

                      <div className={styles.problemMeta}>
                        <span>
                          <strong>Дата:</strong> {formatDate(problem.createdAt)}
                        </span>
                        <span>
                          <strong>Водоём:</strong>{' '}
                          {problem.waterBody?.name || problem.waterBodyId || '—'}
                        </span>
                      </div>

                      {problem.moderationNote ? (
                        <div className={styles.problemNote}>
                          <strong>Комментарий модератора:</strong> {problem.moderationNote}
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </ProtectedShell>
  );
}
