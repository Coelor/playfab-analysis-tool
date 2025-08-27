import React, { useState, useEffect } from 'react';
import { PlayerDto, UserDataResponseDto, PlayerAnalyticsDto, FilesResponseDto, ObjectsResponseDto } from '../types/Player';
import { playersApi, handleApiError } from '../services/api';
import PlayerAnalyticsChart from './PlayerAnalyticsChart';
import './PlayerDetails.css';

interface PlayerDetailsProps {
  playFabId: string;
  onBack: () => void;
}

const PlayerDetails: React.FC<PlayerDetailsProps> = ({ playFabId, onBack }) => {
  const [player, setPlayer] = useState<PlayerDto | null>(null);
  const [userData, setUserData] = useState<UserDataResponseDto | null>(null);
  const [analytics, setAnalytics] = useState<PlayerAnalyticsDto | null>(null);
  const [files, setFiles] = useState<FilesResponseDto | null>(null);
  const [objects, setObjects] = useState<ObjectsResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'userdata' | 'analytics' | 'files' | 'objects'>('details');

  useEffect(() => {
    fetchPlayerData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playFabId]);

  const fetchPlayerData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all player data in parallel
      const [playerData, userDataResponse, analyticsData, filesResponse, objectsResponse] = await Promise.allSettled([
        playersApi.getPlayerById(playFabId),
        playersApi.getUserData(playFabId),
        playersApi.getPlayerAnalytics(playFabId),
        playersApi.getPlayerFiles(playFabId),
        playersApi.getPlayerObjects(playFabId),
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

      if (filesResponse.status === 'fulfilled') {
        setFiles(filesResponse.value);
      }

      if (objectsResponse.status === 'fulfilled') {
        setObjects(objectsResponse.value);
      }

      if (playerData.status === 'rejected') {
        throw new Error('Failed to fetch player data');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(`Failed to fetch player data: ${errorMessage}`);
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

  const downloadFile = async (fileName: string) => {
    try {
      const blob = await playersApi.downloadPlayerFile(playFabId, fileName);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Failed to download file');
    }
  };

  const analyzeFile = async (fileName: string) => {
    try {
      const analysis = await playersApi.analyzePlayerFile(playFabId, fileName);
      alert(`File Analysis:\nRows: ${analysis.rowCount}\nHeaders: ${analysis.headers.join(', ')}`);
    } catch (err) {
      console.error('Error analyzing file:', err);
      alert('Failed to analyze file');
    }
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
        <button 
          className={`tab ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          Files {files && `(${files.totalFiles})`}
        </button>
        <button 
          className={`tab ${activeTab === 'objects' ? 'active' : ''}`}
          onClick={() => setActiveTab('objects')}
        >
          Objects {objects && `(${objects.totalObjects})`}
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

        {activeTab === 'files' && (
          <div className="files-tab">
            {files && files.files.length > 0 ? (
              <div className="files-grid">
                <div className="files-summary">
                  <h3>Files Summary</h3>
                  <p>Total Files: {files.totalFiles}</p>
                  <p>Total Size: {(files.totalSizeBytes / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                
                {files.files.map((file) => (
                  <div key={file.fileName} className="file-card">
                    <h4>{file.fileName}</h4>
                    <div className="file-info">
                      <div className="info-row">
                        <span className="label">Size:</span>
                        <span className="value">{(file.fileSize / 1024).toFixed(2)} KB</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Type:</span>
                        <span className="value">{file.contentType}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Modified:</span>
                        <span className="value">{formatDate(file.lastModified)}</span>
                      </div>
                    </div>
                    <div className="file-actions">
                      <button 
                        onClick={() => downloadFile(file.fileName)}
                        className="download-button"
                      >
                        Download
                      </button>
                      {file.contentType.includes('csv') && (
                        <button 
                          onClick={() => analyzeFile(file.fileName)}
                          className="analyze-button"
                        >
                          Analyze
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <p>No files available for this player.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'objects' && (
          <div className="objects-tab">
            {objects && objects.objects.length > 0 ? (
              <div className="objects-grid">
                <div className="objects-summary">
                  <h3>Objects Summary</h3>
                  <p>Total Objects: {objects.totalObjects}</p>
                  <p>Profile Version: {objects.profileVersion}</p>
                </div>
                
                {objects.objects.map((obj) => (
                  <div key={obj.objectName} className="object-card">
                    <h4>{obj.objectName}</h4>
                    <div className="object-content">
                      <pre>{JSON.stringify(obj.objectData, null, 2)}</pre>
                    </div>
                    <div className="object-meta">
                      {obj.lastModified && (
                        <span>Last Modified: {formatDate(obj.lastModified)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <p>No objects available for this player.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerDetails;