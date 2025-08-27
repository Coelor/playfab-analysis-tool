import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { PlayerAnalyticsDto } from '../types/Player';
import ErrorBoundary from './ErrorBoundary';
import './PlayerAnalyticsChart.css';
import './ErrorBoundary.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface PlayerAnalyticsChartProps {
  analytics: PlayerAnalyticsDto;
}

const PlayerAnalyticsChart: React.FC<PlayerAnalyticsChartProps> = ({ analytics }) => {
  // Add safety checks for analytics data
  if (!analytics) {
    return <div className="no-data">No analytics data available</div>;
  }

  // Prepare statistics data for bar chart
  const statistics = analytics.accountSummary?.statistics || {};
  const statisticsLabels = Object.keys(statistics);
  const statisticsValues = Object.values(statistics).map(value => 
    typeof value === 'number' ? value : 0
  );

  const statisticsChartData = {
    labels: statisticsLabels,
    datasets: [
      {
        label: 'Player Statistics',
        data: statisticsValues,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const statisticsOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Player Statistics',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Prepare linked accounts data for doughnut chart
  const linkedAccounts = analytics.accountSummary?.linkedAccounts || [];
  const accountsData = {
    labels: linkedAccounts.length > 0 ? linkedAccounts : ['No Linked Accounts'],
    datasets: [
      {
        data: linkedAccounts.length > 0 
          ? linkedAccounts.map(() => 1)
          : [1],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
        borderWidth: 1,
      },
    ],
  };

  const accountsOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Linked Accounts',
      },
    },
  };


  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <ErrorBoundary>
      <div className="analytics-dashboard">
      <div className="analytics-summary">
        <div className="summary-card">
          <h3>Account Age</h3>
          <div className="metric">{analytics.accountAge || 0} days</div>
          <div className="sub-metric">Since creation</div>
        </div>
        
        <div className="summary-card">
          <h3>Last Login</h3>
          <div className="metric">{analytics.daysSinceLastLogin || 0} days ago</div>
          <div className="sub-metric">Days since login</div>
        </div>
        
        <div className="summary-card">
          <h3>Total Value</h3>
          <div className="metric">${analytics.totalValueToDateInUSD || 0}</div>
          <div className="sub-metric">Lifetime value</div>
        </div>
        
        <div className="summary-card">
          <h3>Linked Accounts</h3>
          <div className="metric">{analytics.linkedAccountsCount}</div>
          <div className="sub-metric">Connected platforms</div>
        </div>

        <div className="summary-card">
          <h3>User Data</h3>
          <div className="metric">{analytics.userDataKeysCount}</div>
          <div className="sub-metric">Data keys</div>
        </div>

        <div className="summary-card">
          <h3>Files</h3>
          <div className="metric">{analytics.totalFilesCount}</div>
          <div className="sub-metric">{formatBytes(analytics.totalFileSizeBytes)}</div>
        </div>

        <div className="summary-card">
          <h3>Objects</h3>
          <div className="metric">{analytics.totalObjectsCount}</div>
          <div className="sub-metric">Stored objects</div>
        </div>
      </div>

      <div className="charts-container">
        {statisticsLabels.length > 0 && (
          <div className="chart-section">
            <Bar data={statisticsChartData} options={statisticsOptions} />
          </div>
        )}
        
        <div className="chart-section">
          <Doughnut data={accountsData} options={accountsOptions} />
        </div>
      </div>

      {analytics.userDataSummary.availableKeys && analytics.userDataSummary.availableKeys.length > 0 && (
        <div className="userdata-keys-section">
          <h3>Available User Data Keys ({analytics.userDataSummary.totalEntries} total)</h3>
          <div className="keys-grid">
            {analytics.userDataSummary.availableKeys.map((key, index) => (
              <span key={index} className="key-badge">
                {key}
              </span>
            ))}
          </div>
        </div>
      )}

      {analytics.filesSummary.files && analytics.filesSummary.files.length > 0 && (
        <div className="files-section">
          <h3>Files Summary ({analytics.filesSummary.totalFiles} files, {formatBytes(analytics.filesSummary.totalSizeBytes)})</h3>
          <div className="files-list">
            {analytics.filesSummary.files.map((file, index) => (
              <div key={index} className="file-item">
                <span className="file-name">{file.fileName}</span>
                <span className="file-size">({formatBytes(file.fileSize)})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {analytics.objectsSummary.objects && analytics.objectsSummary.objects.length > 0 && (
        <div className="objects-section">
          <h3>Objects Summary ({analytics.objectsSummary.totalObjects} objects)</h3>
          <div className="objects-list">
            {analytics.objectsSummary.objects.map((obj, index) => (
              <div key={index} className="object-item">
                <span className="object-name">{obj.objectName}</span>
                <span className="object-type">{typeof obj.objectData}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="raw-statistics">
        <h3>Raw Statistics Data</h3>
        <div className="statistics-grid">
          {Object.entries(statistics).map(([key, value]) => (
            <div key={key} className="stat-item">
              <span className="stat-key">{key}</span>
              <span className="stat-value">
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
            </div>
          ))}
        </div>
        {Object.keys(statistics).length === 0 && (
          <p className="no-data">No statistics available for this player.</p>
        )}
      </div>
      </div>
    </ErrorBoundary>
  );
};

export default PlayerAnalyticsChart;