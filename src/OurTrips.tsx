import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Trip {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: {
    gradient: string;
    border: string;
    shadow: string;
    textDark: string;
    textLight: string;
  };
}

const OurTrips: React.FC = () => {
  const navigate = useNavigate();

  const trips: Trip[] = [
    {
      id: 'krabi',
      name: 'Krabi',
      emoji: '🏖️',
      description: 'Memories from our Krabi adventure',
      color: {
        gradient: 'linear-gradient(135deg, #FEF3E2 0%, #FED7AA 100%)',
        border: '#FB923C',
        shadow: 'rgba(251, 146, 60, 0.2)',
        textDark: '#92400E',
        textLight: '#B45309'
      }
    },
    {
      id: 'baku',
      name: 'Baku',
      emoji: '🌃',
      description: 'Memories from our Baku adventure',
      color: {
        gradient: 'linear-gradient(135deg, #DDD6FE 0%, #C7D2FE 100%)',
        border: '#A78BFA',
        shadow: 'rgba(167, 139, 250, 0.2)',
        textDark: '#4C1D95',
        textLight: '#6D28D9'
      }
    }
  ];

  const handleTripClick = (tripId: string) => {
    navigate(`/our-trips/${tripId}`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8F9FA',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", sans-serif'
    }}>
      {/* Modern Mobile Header - 60px height */}
      <div style={{
        background: '#FFFFFF',
        height: '60px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderBottom: '1px solid #E4E6EA'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: 480,
          margin: '0 auto',
          height: '100%',
          padding: '0 16px'
        }}>
          <button
            onClick={() => navigate('/hangout')}
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
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8F9FA'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            ←
          </button>
          <h1 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#050505',
            lineHeight: '1.3',
            margin: 0
          }}>
            Our Trips
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

      <div style={{
        maxWidth: 480,
        margin: '0 auto',
        padding: '16px'
      }}>
        {/* Trips Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '12px'
        }}>
          {trips.map((trip) => (
            <div
              key={trip.id}
              style={{
                background: trip.color.gradient,
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: `2px solid ${trip.color.border}`,
                boxShadow: `0 1px 3px ${trip.color.shadow}`,
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
              onClick={() => handleTripClick(trip.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = `0 4px 12px ${trip.color.shadow}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = `0 1px 3px ${trip.color.shadow}`;
              }}
            >
              <div style={{
                fontSize: '48px',
                lineHeight: 1,
                flexShrink: 0
              }}>
                {trip.emoji}
              </div>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  lineHeight: '1.3',
                  margin: '0 0 4px 0',
                  color: trip.color.textDark
                }}>
                  {trip.name}
                </h3>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '1.4',
                  color: trip.color.textLight,
                  margin: 0
                }}>
                  {trip.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OurTrips;
