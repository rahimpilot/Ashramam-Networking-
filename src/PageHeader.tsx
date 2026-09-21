import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  backTo: string;
  backLabel?: string;
  /** When provided, the back button calls this instead of navigating (e.g. for in-page back steps). */
  onBack?: () => void;
}

/** Shared sticky page header used across the Hangout section. */
const PageHeader: React.FC<PageHeaderProps> = ({ title, backTo, backLabel, onBack }) => {
  const navigate = useNavigate();

  return (
    <div style={{
      background: '#FFFFFF',
      height: '60px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      borderBottom: '1px solid #ECEEF1'
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
            background: 'none',
            border: 'none',
            color: '#1877F2',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F6F7F9'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          aria-label={backLabel || 'Back'}
        >
          ←
        </button>
        <h1 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#050505',
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
            opacity: 0.8
          }}
        />
      </div>
    </div>
  );
};

export default PageHeader;
