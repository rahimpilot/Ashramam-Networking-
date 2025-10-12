import React from 'react';

const Login: React.FC = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 font-sans">
      {/* Google Fonts: Inter */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`body { font-family: 'Inter', sans-serif; }`}</style>
      
      {/* Logo perfectly centered on page */}
      <div className="min-h-screen flex items-center justify-center">
        <img 
          src="/newlogo.svg" 
          alt="Ashramam Vibes Logo" 
          className="h-auto w-auto object-contain drop-shadow-md"
          onError={(e) => {
            console.error('Logo failed to load');
            e.currentTarget.src = '/logo.png'; // Fallback to previous logo
          }}
        />
      </div>
    </div>
  );
};

export default Login;
