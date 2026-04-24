'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { User } from '@/types';
import { UserAvatar } from './UserAvatar';

const navLinks = [
  { href: '/portal', label: 'Главная' },
  { href: '/water-bodies', label: 'Озёра' },
  { href: 'https://kay12dar-ecowaterai-app-ivrgcv.streamlit.app/', label: 'ИИ-анализ', external: true },
  { href: '/report-problem', label: 'Сообщить о проблеме' },
];

export function Header({ user }: { user: User | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const closeMenu = () => {
    setIsOpen(false);
    setIsProfileMenuOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleProfileNavigate = () => {
    closeMenu();
    router.push('/profile');
  };

  const handleLogout = () => {
    closeMenu();
    api.logout();
  };

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/portal" className="brand-block" onClick={closeMenu}>
          <div className="landing-logo__icon">A</div>
          <div className="brand-copy">
            <div className="brand-title">AquaSense Portal</div>
            <div className="brand-subtitle">Мониторинг озёр и показателей воды</div>
          </div>
        </Link>

        <button
          type="button"
          className={`burger ${isOpen ? 'is-open' : ''}`}
          aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`header-nav ${isOpen ? 'open' : ''}`} aria-label="Основная навигация">
          {navLinks.map((link) => (
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                onClick={closeMenu}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={pathname === link.href || pathname.startsWith(`${link.href}/`) ? 'is-active' : ''}
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            )
          ))}
        </nav>

        <div
          ref={profileMenuRef}
          className={`header-user ${isOpen ? 'open' : ''} ${isProfileMenuOpen ? 'menu-open' : ''}`}
        >
          <button
            type="button"
            className="profile-chip profile-chip--button"
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            aria-haspopup="menu"
            aria-expanded={isProfileMenuOpen}
            aria-label="Открыть меню профиля"
          >
            <UserAvatar
              name={user?.login || user?.email}
              avatarUrl={user?.avatarUrl}
              size={40}
            />
            <div>
              <div className="profile-chip__name">{user?.login || 'Пользователь'}</div>
              <div className="profile-chip__meta">{user?.email || 'Открыть профиль'}</div>
            </div>
            <span className={`profile-chip__caret ${isProfileMenuOpen ? 'is-open' : ''}`} aria-hidden="true">
              ▾
            </span>
          </button>

          <div className={`profile-dropdown ${isProfileMenuOpen ? 'open' : ''}`} role="menu">
            <button
              type="button"
              className="profile-dropdown__item"
              onClick={handleProfileNavigate}
              role="menuitem"
            >
              Личный кабинет
            </button>
            <button
              type="button"
              className="profile-dropdown__item profile-dropdown__item--danger"
              onClick={handleLogout}
              role="menuitem"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
