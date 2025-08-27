import React from 'react';
import { PlayerSummaryDto } from '../../types';
import PlayerCard from './PlayerCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';
import './PlayerGrid.css';

interface PlayerGridProps {
  players: PlayerSummaryDto[];
  loading: boolean;
  error: string | null;
  onPlayerSelect: (playFabId: string) => void;
  onRetry?: () => void;
}

const PlayerGrid: React.FC<PlayerGridProps> = ({ 
  players, 
  loading, 
  error, 
  onPlayerSelect, 
  onRetry 
}) => {
  if (loading) {
    return <LoadingSpinner message="Loading players..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={onRetry} />;
  }

  if (players.length === 0) {
    return (
      <div className="no-players">
        <p>No players found.</p>
        <p>Make sure your PlayFab configuration is correct.</p>
      </div>
    );
  }

  return (
    <div className="players-grid">
      {players.map((player) => (
        <PlayerCard
          key={player.playFabId}
          player={player}
          onClick={onPlayerSelect}
        />
      ))}
    </div>
  );
};

export default PlayerGrid;