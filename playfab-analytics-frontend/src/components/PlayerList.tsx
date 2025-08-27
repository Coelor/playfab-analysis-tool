import React, { useState, useEffect } from 'react';
import { PlayerSummaryDto, GetPlayersRequest } from '../types/Player';
import { playersApi, handleApiError } from '../services/api';
import './PlayerList.css';

interface PlayerListProps {
  onPlayerSelect: (playFabId: string) => void;
}

const PlayerList: React.FC<PlayerListProps> = ({ onPlayerSelect }) => {
  const [players, setPlayers] = useState<PlayerSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const pageSize = 20;

  useEffect(() => {
    fetchPlayers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPlayers();
  };


  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const request: GetPlayersRequest = {
        pageNumber: currentPage,
        pageSize,
        searchTerm: searchTerm || undefined
      };
      
      const response = await playersApi.getAllPlayers(request);
      setPlayers(response.items);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
      setError(null);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(`Failed to fetch players: ${errorMessage}`);
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
      <div className="list-header">
        <h2>Players ({totalCount})</h2>
        <div className="controls">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">Search</button>
          </form>
          <button onClick={fetchPlayers} className="refresh-button">
            Refresh
          </button>
        </div>
      </div>

      
      <div className="players-grid">
        {players && players.length > 0 ? players.map((player) => (
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
        )) : (
          <div className="no-players">
            {loading ? 'Loading...' : 'No players found'}
          </div>
        )}
      </div>

      {players && players.length === 0 && !loading && (
        <div className="no-players">
          No players found. {searchTerm ? 'Try adjusting your search criteria.' : 'Make sure your PlayFab configuration is correct.'}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(currentPage - 1)} 
            disabled={currentPage === 1}
            className="pagination-button"
          >
            Previous
          </button>
          
          <span className="page-info">
            Page {currentPage} of {totalPages} ({totalCount} total)
          </span>
          
          <button 
            onClick={() => setCurrentPage(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PlayerList;