import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  backTo: string;
  backLabel?: string;
  /** When provided, the back button calls this instead of navigating (e.g. for in-page back steps). */
  onBack?: () => void;
}

/** Shared sticky page header used across the Hangout section. — Ivory Atelier edition */
const PageHeader: React.FC<PageHeaderProps> = ({ title, backTo, backLabel, onBack }) => {
  const navigate = useNavigate();

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.88)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      height: '64px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 12px rgba(90, 70, 45, 0.07)',
      borderBottom: '1px solid rgba(91, 155, 213, 0.18)'
    }}>
      <div
        className="iv-page"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%'
        }}
      >
        <button
          onClick={() => (onBack ? onBack() : navigate(backTo))}
          style={{
            background: 'linear-gradient(135deg, #6fb1e8, #4a8fd0)',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            boxShadow: '0 4px 12px rgba(91, 155, 213, 0.45)',
            transition: 'filter 0.2s ease, transform 0.15s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.93)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'scale(1)'; }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.94)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          aria-label={backLabel || 'Back'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 style={{
          fontFamily: "'Marcellus', Georgia, serif",
          fontSize: '23px',
          fontWeight: 600,
          letterSpacing: '0.3px',
          color: '#1c1915',
          lineHeight: '1.3',
          margin: 0,
          flex: 1,
          minWidth: 0,
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          padding: '0 8px'
        }}>
          {title}
        </h1>
        <img
          src="/newlogo.svg"
          alt="Logo"
          style={{
            height: 32,
            width: 'auto',
            maxWidth: '100px',
            opacity: 0.9
          }}
        />
      </div>
    </div>
  );
};

export default PageHeader;
