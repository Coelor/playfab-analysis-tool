import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PlayerListRefactored from './components/PlayerListRefactored';
import PlayerDetails from './components/PlayerDetails';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

const App: React.FC = () => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const handlePlayerSelect = (playFabId: string) => {
    setSelectedPlayerId(playFabId);
  };

  const handleBackToList = () => {
    setSelectedPlayerId(null);
  };

  return (
    <Router>
      <ErrorBoundary>
        <div className="App">
          <header className="app-header">
            <div className="header-content">
              <h1>PlayFab Analytics Dashboard</h1>
              <div className="header-info">
                <span className="backend-url">Backend: http://localhost:5000</span>
              </div>
            </div>
          </header>

          <main className="app-main">
            <ErrorBoundary>
              <Routes>
                <Route 
                  path="/" 
                  element={
                    selectedPlayerId ? (
                      <PlayerDetails 
                        playFabId={selectedPlayerId} 
                        onBack={handleBackToList} 
                      />
                    ) : (
                      <PlayerListRefactored onPlayerSelect={handlePlayerSelect} />
                    )
                  } 
                />
                <Route 
                  path="/player/:playFabId" 
                  element={<PlayerDetailsRoute onBack={handleBackToList} />} 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          </main>

          <footer className="app-footer">
            <div className="footer-content">
              <p>PlayFab Analytics Tool - Built with React & TypeScript</p>
              <p>Make sure your .NET backend is running on port 5000</p>
            </div>
          </footer>
        </div>
      </ErrorBoundary>
    </Router>
  );
};

// Component to handle URL-based player details
const PlayerDetailsRoute: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const playFabId = window.location.pathname.split('/').pop();

  if (!playFabId) {
    return <Navigate to="/" replace />;
  }

  return <PlayerDetails playFabId={playFabId} onBack={onBack} />;
};

export default App;