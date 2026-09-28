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

/** Shared bottom tab bar — Floating Dock edition. */
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
      className={`iv-bottom-nav${className ? ' ' + className : ''}`}
      style={{
        position: 'fixed',
        left: '14px',
        right: '14px',
        bottom: 'calc(12px + env(safe-area-inset-bottom))',
        background: 'rgba(255, 255, 255, 0.97)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.9)',
        borderRadius: '24px',
        boxShadow: '0 12px 32px rgba(40, 70, 110, 0.22)',
        padding: '6px 8px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 1000
      }}
    >
      {TABS.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => tab.go(navigate)}
            style={{
              background: active ? 'rgba(91, 155, 213, 0.14)' : 'none',
              border: 'none',
              padding: '7px 0 8px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              transition: 'background 0.2s ease',
              minWidth: '60px',
              flex: 1,
              borderRadius: '18px',
              fontFamily: 'inherit'
            }}
          >
            <span style={{
              fontSize: '20px',
              lineHeight: 1,
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              background: active ? '#4a86c8' : 'transparent',
              boxShadow: active ? '0 4px 10px rgba(74, 134, 200, 0.4)' : 'none',
              transition: 'all 0.2s ease'
            }}>
              {tab.icon}
            </span>
            <span style={{
              fontSize: '10.5px',
              fontWeight: active ? 700 : 500,
              letterSpacing: '0.3px',
              color: active ? '#4a86c8' : '#9dafbe'
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
