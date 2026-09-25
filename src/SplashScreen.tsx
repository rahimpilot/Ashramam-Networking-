import React from 'react';

interface SplashScreenProps {
  /** When true the overlay fades out before unmounting. */
  fading: boolean;
}

/** Full-screen brand splash: visitors opening a public link see the logo
 *  loading screen first, then land on the article / cinema page. */
const SplashScreen: React.FC<SplashScreenProps> = ({ fading }) => {
  return (
    <div className="splash-overlay" style={{ opacity: fading ? 0 : 1 }}>
      <div className="splash-card">
        <img src="/newlogo.svg" alt="Ashramam Vibes" className="splash-logo" />
      </div>
      <div className="splash-title">Ashramam Vibes</div>
      <div className="splash-bar">
        <div className="splash-bar-fill" />
      </div>
    </div>
  );
};

export default SplashScreen;
