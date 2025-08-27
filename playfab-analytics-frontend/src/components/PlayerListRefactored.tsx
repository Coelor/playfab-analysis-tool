import React from 'react';
import { usePlayerList } from '../hooks/usePlayerList';
import PlayerGrid from './player/PlayerGrid';
import SearchBox from './ui/SearchBox';
import Pagination from './ui/Pagination';
import './PlayerListRefactored.css';

interface PlayerListProps {
  onPlayerSelect: (playFabId: string) => void;
}

const PlayerListRefactored: React.FC<PlayerListProps> = ({ onPlayerSelect }) => {
  const {
    players,
    loading,
    error,
    pagination,
    searchTerm,
    setCurrentPage,
    setSearchTerm,
    refetch
  } = usePlayerList();

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="player-list-container">
      <div className="list-header">
        <h2>Players ({pagination.totalCount})</h2>
        <div className="controls">
          <SearchBox
            onSearch={handleSearch}
            placeholder="Search players..."
            initialValue={searchTerm}
          />
          <button onClick={handleRefresh} className="refresh-button">
            Refresh
          </button>
        </div>
      </div>

      <PlayerGrid
        players={players}
        loading={loading}
        error={error}
        onPlayerSelect={onPlayerSelect}
        onRetry={refetch}
      />

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalCount}
        onPageChange={setCurrentPage}
        disabled={loading}
      />
    </div>
  );
};

export default PlayerListRefactored;