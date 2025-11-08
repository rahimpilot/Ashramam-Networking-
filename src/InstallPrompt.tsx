import React, { useState, useEffect } from 'react';
import { PWAService } from './pwaService';

const pwaService = new PWAService();

export const InstallPrompt: React.FC = () => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Listen for PWA install availability
    const handleInstallAvailable = () => {
      setShowInstallPrompt(true);
    };

    const handleInstallCompleted = () => {
      setShowInstallPrompt(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleInstallSuccess = (e: CustomEvent) => {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable as EventListener);
    window.addEventListener('pwa-install-completed', handleInstallCompleted as EventListener);
    window.addEventListener('pwa-install-success', handleInstallSuccess as EventListener);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable as EventListener);
      window.removeEventListener('pwa-install-completed', handleInstallCompleted as EventListener);
      window.removeEventListener('pwa-install-success', handleInstallSuccess as EventListener);
    };
  }, []);

  const handleInstall = async () => {
    await pwaService.installApp();
  };

  if (showSuccess) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#16a34a',
        color: 'white',
        padding: '16px 24px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 9999,
        animation: 'slideIn 0.3s ease-out'
      }}>
        ✅ Ashramam app installed successfully!
      </div>
    );
  }

  if (!showInstallPrompt) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: 'white',
      padding: '16px 24px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 9999,
      animation: 'slideIn 0.3s ease-out'
    }}>
      <div style={{ marginBottom: '12px', fontWeight: 600, color: '#1f2937' }}>
        Install Ashramam App
      </div>
      <p style={{
        margin: '0 0 16px 0',
        fontSize: '14px',
        color: '#6b7280'
      }}>
        Add Ashramam to your home screen for quick access!
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={handleInstall}
          style={{
            flex: 1,
            padding: '10px 16px',
            backgroundColor: '#16a34a',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#15803d')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#16a34a')}
        >
          Install
        </button>
        <button
          onClick={() => setShowInstallPrompt(false)}
          style={{
            padding: '10px 16px',
            backgroundColor: '#e5e7eb',
            color: '#374151',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d1d5db')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
        >
          Later
        </button>
      </div>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default InstallPrompt;
