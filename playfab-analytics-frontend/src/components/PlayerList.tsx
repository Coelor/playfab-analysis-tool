import React, { useState, useEffect } from 'react';
import { Player } from '../types/Player';
import { playersApi } from '../services/api';
import './PlayerList.css';

interface PlayerListProps {
  onPlayerSelect: (playFabId: string) => void;
}

const PlayerList: React.FC<PlayerListProps> = ({ onPlayerSelect }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const playerData = await playersApi.getAllPlayers();
      setPlayers(playerData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch players. Make sure the backend is running on http://localhost:5000');
      console.error('Error fetching players:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="player-list">
        <h2>Players</h2>
        <div className="loading">Loading players...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="player-list">
        <h2>Players</h2>
        <div className="error">
          {error}
          <button onClick={fetchPlayers} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="player-list">
      <h2>Players ({players.length})</h2>
      <button onClick={fetchPlayers} className="refresh-button">
        Refresh
      </button>
      
      <div className="players-grid">
        {players.map((player) => (
          <div
            key={player.playFabId}
            className="player-card"
            onClick={() => onPlayerSelect(player.playFabId)}
          >
            <div className="player-header">
              <h3>{player.displayName || 'Unknown Player'}</h3>
              <span className="player-id">{player.playFabId}</span>
            </div>
            
            <div className="player-info">
              <div className="info-row">
                <span className="label">Created:</span>
                <span>{formatDate(player.created)}</span>
              </div>
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
                <span>{player.linkedAccounts.length}</span>
              </div>
            </div>

            <div className="linked-accounts">
              {player.linkedAccounts.map((account) => (
                <span key={account} className="account-badge">
                  {account}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {players.length === 0 && (
        <div className="no-players">
          No players found. Make sure your PlayFab configuration is correct.
        </div>
      )}
    </div>
  );
};

export default PlayerList;