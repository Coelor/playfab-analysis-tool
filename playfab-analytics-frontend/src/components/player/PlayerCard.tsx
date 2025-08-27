import React from 'react';
import { PlayerSummaryDto } from '../../types';
import './PlayerCard.css';

interface PlayerCardProps {
  player: PlayerSummaryDto;
  onClick: (playFabId: string) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, onClick }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div
      className="player-card"
      onClick={() => onClick(player.playFabId)}
    >
      <div className="player-header">
        <h3>{player.displayName || 'Unknown Player'}</h3>
        <span className="player-id">{player.playFabId}</span>
      </div>
      
      <div className="player-info">
        <div className="info-row">
          <span className="label">Last Login:</span>
          <span>{formatDate(player.lastLogin)}</span>
        </div>
        <div className="info-row">
          <span className="label">Value:</span>
          <span>${player.totalValueToDateInUSD || 0}</span>
        </div>
        <div className="info-row">
          <span className="label">Linked Accounts:</span>
          <span>{player.linkedAccountsCount}</span>
        </div>
        <div className="info-row">
          <span className="label">Statistics:</span>
          <span>{player.statisticsCount}</span>
        </div>
      </div>

      <div className="player-stats">
        <span className="stat-badge">Accounts: {player.linkedAccountsCount}</span>
        <span className="stat-badge">Stats: {player.statisticsCount}</span>
      </div>
    </div>
  );
};

export default PlayerCard;