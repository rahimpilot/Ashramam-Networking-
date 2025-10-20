import React from 'react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onAgree: () => void;
  onCancel: () => void;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onAgree, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        padding: '2rem',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem'
        }}>
          <img src="/newlogo.svg" alt="Logo" style={{ height: 48, marginRight: '1rem' }} />
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#111827',
            margin: 0
          }}>Terms and Disclaimer</h2>
        </div>

        <div style={{
          color: '#374151',
          lineHeight: '1.7',
          fontSize: '1rem',
          textAlign: 'left'
        }}>
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
            border: '2px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <p style={{ 
              margin: 0, 
              fontSize: '1.05rem', 
              color: '#1e293b',
              fontWeight: '500',
              letterSpacing: '0.3px'
            }}>
              സുഹൃത്തുകളെ,<br/>
സുഖം എന്ന് കരുതുന്നു. ഇത് നമ്മുടെ സ്വകാര്യ ഇടമാണ്, ആയതിനാൽ സ്വകാര്യം ആയി തന്നെ കൊണ്ട് നടക്കുക. എന്ന് വെച്ച് കുടുംബം തകരുന്ന ഒരു സ്വകാര്യതയും സ്വാലിഹീങ്ങളായ നമ്മൾക്കിടയിൽ ഇല്ലല്ലോ. നമ്മുടെ ഒത്തൊരുമിച്ചുള്ള സംഭവങ്ങളും കഥകളും അടങ്ങിയ ഒരു സോഷ്യൽ മീഡിയ നെറ്റ്‌വർക്ക് എന്ന് സാരം. ഈ സ്പേസിൽ നമ്മൾ 13 പേർക്ക് മാത്രമേ ലോഗിൻ ചെയ്യാൻ ആവൂ, വേറെ ഒരു മൈരന്മാർക്കും ഇതിൽ കേറാൻ അനുവാദമില്ല്യ. ഇതിന്റെ പൂർണ നിർമ്മാണ കർത്തവ്യം നമുക്ക്  മാത്രമാണ് എന്ന് അറിയിച്ചു കൊണ്ട് എല്ലാ ആശ്രമനിവാസികൾക്കും നമ്മുടെ ഈ പേജിലേക്ക് സ്വാഗതം. ഓക്കെ ആണല്ലോ അല്ലെ?
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end',
          marginTop: '2rem'
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid #d1d5db',
              backgroundColor: '#ffffff',
              color: '#374151',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={e => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseOut={e => {
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
          >
            Cancel
          </button>
          <button
            onClick={onAgree}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: 'linear-gradient(to right, #2563eb, #9333ea)',
              color: '#ffffff',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
          >
            I Agree & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;