import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TABS = [
  { id: 'scrapbook', icon: '🏠', label: 'Scrap Book', go: (n: (p: string) => void) => n('/dashboard') },
  { id: 'stories', icon: '📚', label: 'Stories', go: (n: (p: string) => void) => n('/stories') },
  { id: 'hangout', icon: '🍸', label: 'Hangout', go: (n: (p: string) => void) => n('/hangout') },
  { id: 'people', icon: '👥', label: 'People', go: (n: (p: string) => void) => n('/residents') },
  { id: 'settings', icon: '⚙️', label: 'Settings', go: (n: (p: string) => void) => n('/account') },
];

/** Desktop sidebar navigation — the wide-screen sibling of BottomNavigation.
 *  Hidden below 1024px via the .iv-side-nav CSS rule; BottomNavigation is
 *  hidden above 1024px by the matching rule. */
const SideNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/') return 'scrapbook';
    if (path.startsWith('/stories')) return 'stories';
    if (path.startsWith('/hangout')) return 'hangout';
    if (path.startsWith('/residents')) return 'people';
    if (path === '/account' || path === '/profile' || path === '/admin') return 'settings';
    return '';
  };
  const activeTab = getActiveTab();

  return (
    <nav
      className="iv-side-nav"
      aria-label="Primary"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: '232px',
        flexDirection: 'column',
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRight: '1px solid rgba(91, 155, 213, 0.16)',
        boxShadow: '4px 0 20px rgba(91, 155, 213, 0.10)',
        zIndex: 1000,
        padding: '28px 16px 20px',
        fontFamily: "'Marcellus', Georgia, serif",
        boxSizing: 'border-box'
      }}
    >
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '4px 8px', marginBottom: '28px', textAlign: 'left'
        }}
        aria-label="Ashramam home"
      >
        <img src="/newlogo.svg" alt="Ashramam" style={{ width: '44px', height: '44px', borderRadius: '12px' }} />
        <span style={{ fontSize: '19px', letterSpacing: '0.5px', color: '#1c2733', lineHeight: 1.2 }}>
          Ashramam<br />
          <span style={{ fontSize: '12px', color: '#8ba0b4', letterSpacing: '2px' }}>VIBES</span>
        </span>
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => tab.go(navigate)}
              style={{
                background: active ? 'rgba(91, 155, 213, 0.14)' : 'transparent',
                border: active ? '1px solid rgba(91, 155, 213, 0.30)' : '1px solid transparent',
                borderRadius: '14px',
                padding: '12px 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                width: '100%',
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(91, 155, 213, 0.07)'; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: '1.4rem', lineHeight: 1, width: '28px', textAlign: 'center' }}>{tab.icon}</span>
              <span style={{
                fontSize: '15px',
                fontWeight: active ? 700 : 500,
                letterSpacing: '0.4px',
                color: active ? '#3f7fb8' : '#5c7285'
              }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 'auto', padding: '12px 8px 0', fontSize: '11px', color: '#a9bccd', letterSpacing: '1px' }}>
        ASHRAMAM VIBES
      </div>
    </nav>
  );
};

export default SideNavigation;
