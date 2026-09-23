import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface BottomNavigationProps {
  className?: string;
}

interface Tab {
  id: string;
  icon: string;
  label: string;
  go: (navigate: (path: string) => void) => void;
}

const TABS: Tab[] = [
  { id: 'scrapbook', icon: '🏠', label: 'Scrap Book', go: (n) => n('/dashboard') },
  { id: 'stories', icon: '📚', label: 'Stories', go: (n) => n('/stories') },
  { id: 'hangout', icon: '🍸', label: 'Hangout', go: (n) => n('/hangout') },
  { id: 'people', icon: '👥', label: 'People', go: (n) => n('/residents') },
  { id: 'settings', icon: '⚙️', label: 'Settings', go: (n) => n('/account') },
];

/** Shared bottom tab bar — Ivory Atelier edition. */
const BottomNavigation: React.FC<BottomNavigationProps> = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/') return 'scrapbook';
    if (path === '/stories') return 'stories';
    if (path === '/hangout') return 'hangout';
    if (path === '/residents') return 'people';
    if (path === '/account') return 'settings';
    return 'scrapbook';
  };

  const activeTab = getActiveTab();

  return (
    <div
      className={className}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(91, 155, 213, 0.16)',
        padding: '0.6rem 0.5rem calc(0.6rem + env(safe-area-inset-bottom))',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 1000,
        boxShadow: '0 -4px 20px rgba(90, 70, 45, 0.08)'
      }}
    >
      {TABS.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => tab.go(navigate)}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.4rem 0.5rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.3rem',
              transition: 'all 0.2s ease',
              minWidth: '60px'
            }}
          >
            <span style={{
              fontSize: '1.35rem',
              lineHeight: 1,
              width: '46px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '14px',
              background: active ? 'rgba(91, 155, 213, 0.12)' : 'transparent',
              border: active ? '1px solid rgba(91, 155, 213, 0.28)' : '1px solid transparent',
              transition: 'all 0.2s ease'
            }}>
              {tab.icon}
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: active ? 700 : 500,
              letterSpacing: '0.4px',
              color: active ? '#5b9bd5' : '#9dafbe'
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNavigation;
