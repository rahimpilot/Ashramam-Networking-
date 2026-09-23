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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: 640,
        margin: '0 auto',
        height: '100%',
        padding: '0 16px'
      }}>
        <button
          onClick={() => (onBack ? onBack() : navigate(backTo))}
          style={{
            background: 'transparent',
            border: '1px solid rgba(91, 155, 213, 0.35)',
            color: '#5b9bd5',
            fontSize: '19px',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9f1f8'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          aria-label={backLabel || 'Back'}
        >
          ←
        </button>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
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
