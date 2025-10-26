import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface BottomNavigationProps {
  className?: string;
}

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

  const goToScrapbook = () => navigate('/dashboard');
  const goToStories = () => navigate('/stories');
  const goToHangout = () => navigate('/hangout');
  const goToPeople = () => navigate('/residents');
  const goToSettings = () => navigate('/account');

  return (
    <div
      className={className}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '0.5rem',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 1000,
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)'
      }}
    >
      <button
        onClick={goToScrapbook}
        style={{
          background: 'none',
          border: 'none',
          padding: '0.5rem',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
          color: activeTab === 'scrapbook' ? '#1f2937' : '#64748b',
          transition: 'color 0.2s ease'
        }}
      >
        <span style={{ fontSize: '1.5rem' }}>🏠</span>
        <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>Scrap Book</span>
      </button>

      <button
        onClick={goToStories}
        style={{
          background: 'none',
          border: 'none',
          padding: '0.5rem',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
          color: activeTab === 'stories' ? '#1f2937' : '#64748b',
          transition: 'color 0.2s ease'
        }}
      >
        <span style={{ fontSize: '1.5rem' }}>📚</span>
        <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>Stories</span>
      </button>

      <button
        onClick={goToHangout}
        style={{
          background: 'none',
          border: 'none',
          padding: '0.5rem',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
          color: activeTab === 'hangout' ? '#1f2937' : '#64748b',
          transition: 'color 0.2s ease'
        }}
      >
        <span style={{ fontSize: '1.5rem' }}>🍸</span>
        <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>Hangout</span>
      </button>

      <button
        onClick={goToPeople}
        style={{
          background: 'none',
          border: 'none',
          padding: '0.5rem',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
          color: activeTab === 'people' ? '#1f2937' : '#64748b',
          transition: 'color 0.2s ease'
        }}
      >
        <span style={{ fontSize: '1.5rem' }}>👥</span>
        <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>People</span>
      </button>

      <button
        onClick={goToSettings}
        style={{
          background: 'none',
          border: 'none',
          padding: '0.5rem',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
          color: activeTab === 'settings' ? '#1f2937' : '#64748b',
          transition: 'color 0.2s ease'
        }}
      >
        <span style={{ fontSize: '1.5rem' }}>⚙️</span>
        <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>Settings</span>
      </button>
    </div>
  );
};

export default BottomNavigation;