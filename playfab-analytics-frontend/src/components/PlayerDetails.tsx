import React, { useState, useEffect } from 'react';
import { Player, UserDataResponse, PlayerAnalytics } from '../types/Player';
import { playersApi } from '../services/api';
import PlayerAnalyticsChart from './PlayerAnalyticsChart';
import './PlayerDetails.css';

interface PlayerDetailsProps {
  playFabId: string;
  onBack: () => void;
}

const PlayerDetails: React.FC<PlayerDetailsProps> = ({ playFabId, onBack }) => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [userData, setUserData] = useState<UserDataResponse | null>(null);
  const [analytics, setAnalytics] = useState<PlayerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'userdata' | 'analytics'>('details');

  useEffect(() => {
    fetchPlayerData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playFabId]);

  const fetchPlayerData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all player data in parallel
      const [playerData, userDataResponse, analyticsData] = await Promise.allSettled([
        playersApi.getPlayerById(playFabId),
        playersApi.getUserData(playFabId),
        playersApi.getPlayerAnalytics(playFabId),
      ]);

      if (playerData.status === 'fulfilled') {
        setPlayer(playerData.value);
      }

      if (userDataResponse.status === 'fulfilled') {
        setUserData(userDataResponse.value);
      }

      if (analyticsData.status === 'fulfilled') {
        setAnalytics(analyticsData.value);
      }

      if (playerData.status === 'rejected') {
        throw new Error('Failed to fetch player data');
      }
    } catch (err) {
      setError('Failed to fetch player data. Please try again.');
      console.error('Error fetching player data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  if (loading) {
    return (
      <div className="player-details">
        <button onClick={onBack} className="back-button">← Back to Players</button>
        <div className="loading">Loading player details...</div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="player-details">
        <button onClick={onBack} className="back-button">← Back to Players</button>
        <div className="error">
          {error || 'Player not found'}
          <button onClick={fetchPlayerData} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="player-details">
      <div className="player-header">
        <button onClick={onBack} className="back-button">← Back to Players</button>
        <div className="player-title">
          <h1>{player.displayName || 'Unknown Player'}</h1>
          <span className="player-id">{player.playFabId}</span>
        </div>
        <button onClick={fetchPlayerData} className="refresh-button">
          Refresh
        </button>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Player Details
        </button>
        <button 
          className={`tab ${activeTab === 'userdata' ? 'active' : ''}`}
          onClick={() => setActiveTab('userdata')}
        >
          User Data {userData && `(${Object.keys(userData.data).length})`}
        </button>
        <button 
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'details' && (
          <div className="details-tab">
            <div className="info-grid">
              <div className="info-card">
                <h3>Basic Information</h3>
                <div className="info-row">
                  <span className="label">PlayFab ID:</span>
                  <span className="value">{player.playFabId}</span>
                </div>
                <div className="info-row">
                  <span className="label">Display Name:</span>
                  <span className="value">{player.displayName || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Created:</span>
                  <span className="value">{formatDate(player.created)}</span>
                </div>
                <div className="info-row">
                  <span className="label">Last Login:</span>
                  <span className="value">{formatDate(player.lastLogin)}</span>
                </div>
                <div className="info-row">
                  <span className="label">Total Value:</span>
                  <span className="value">${player.totalValueToDateInUSD || 0}</span>
                </div>
              </div>

              <div className="info-card">
                <h3>Linked Accounts</h3>
                {player.linkedAccounts.length > 0 ? (
                  <div className="linked-accounts">
                    {player.linkedAccounts.map((account, index) => (
                      <span key={index} className="account-badge">
                        {account}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p>No linked accounts</p>
                )}
              </div>

              <div className="info-card">
                <h3>Statistics</h3>
                {Object.keys(player.statistics).length > 0 ? (
                  <div className="statistics">
                    {Object.entries(player.statistics).map(([key, value]) => (
                      <div key={key} className="info-row">
                        <span className="label">{key}:</span>
                        <span className="value">{formatValue(value)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No statistics available</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'userdata' && (
          <div className="userdata-tab">
            {userData && Object.keys(userData.data).length > 0 ? (
              <div className="userdata-grid">
                <div className="userdata-summary">
                  <h3>User Data Summary</h3>
                  <p>Data Version: {userData.dataVersion}</p>
                  <p>Total Keys: {Object.keys(userData.data).length}</p>
                </div>
                
                {Object.entries(userData.data).map(([key, record]) => (
                  <div key={key} className="userdata-card">
                    <h4>{record.key}</h4>
                    <div className="userdata-content">
                      <pre>{record.value}</pre>
                    </div>
                    <div className="userdata-meta">
                      <span>Last Updated: {formatDate(record.lastUpdated)}</span>
                      <span>Permission: {record.permission}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <p>No user data available for this player.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-tab">
            {analytics ? (
              <PlayerAnalyticsChart analytics={analytics} />
            ) : (
              <div className="no-data">
                <p>No analytics data available for this player.</p>
                <p>Make sure the backend analytics service is working properly.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerDetails;