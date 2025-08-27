import React, { useState } from 'react';
import { usePlayerDetails } from '../hooks/usePlayerDetails';
import PlayerAnalyticsChart from './PlayerAnalyticsChart';
import LoadingSpinner from './ui/LoadingSpinner';
import ErrorMessage from './ui/ErrorMessage';
import './PlayerDetails.css';

interface PlayerDetailsProps {
  playFabId: string;
  onBack: () => void;
}

const PlayerDetails: React.FC<PlayerDetailsProps> = ({ playFabId, onBack }) => {
  const {
    player,
    userData,
    analytics,
    files,
    objects,
    loading,
    error,
    refetch,
    downloadFile,
    analyzeFile,
  } = usePlayerDetails(playFabId);

  const [activeTab, setActiveTab] = useState<'details' | 'userdata' | 'analytics' | 'files' | 'objects'>('details');

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const handleDownloadFile = async (fileName: string) => {
    try {
      await downloadFile(fileName);
    } catch (err) {
      alert('Failed to download file');
    }
  };

  const handleAnalyzeFile = async (fileName: string) => {
    try {
      const analysis = await analyzeFile(fileName);
      alert(`File Analysis:\nRows: ${analysis.rowCount}\nHeaders: ${analysis.headers.join(', ')}`);
    } catch (err) {
      alert('Failed to analyze file');
    }
  };

  if (loading) {
    return (
      <div className="player-details">
        <button onClick={onBack} className="back-button">← Back to Players</button>
        <LoadingSpinner message="Loading player details..." />
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="player-details">
        <button onClick={onBack} className="back-button">← Back to Players</button>
        <ErrorMessage message={error || 'Player not found'} onRetry={refetch} />
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
        <button onClick={refetch} className="refresh-button">
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
                        onClick={() => handleDownloadFile(file.fileName)}
                        className="download-button"
                      >
                        Download
                      </button>
                      {file.contentType.includes('csv') && (
                        <button 
                          onClick={() => handleAnalyzeFile(file.fileName)}
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