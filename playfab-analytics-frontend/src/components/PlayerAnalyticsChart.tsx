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
import { PlayerAnalytics } from '../types/Player';
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
  analytics: PlayerAnalytics;
}

const PlayerAnalyticsChart: React.FC<PlayerAnalyticsChartProps> = ({ analytics }) => {
  // Add safety checks for analytics data
  if (!analytics) {
    return <div className="no-data">No analytics data available</div>;
  }

  // Prepare statistics data for bar chart
  const statistics = analytics.statistics || {};
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
  const linkedAccounts = analytics.linkedAccounts || [];
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid Date';
    }
  };

  const daysSinceCreation = () => {
    if (!analytics.createdDate) return 0;
    try {
      const created = new Date(analytics.createdDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - created.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  const daysSinceLastActivity = () => {
    if (!analytics.lastActivity) return 0;
    try {
      const lastActivity = new Date(analytics.lastActivity);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - lastActivity.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  return (
    <ErrorBoundary>
      <div className="analytics-dashboard">
      <div className="analytics-summary">
        <div className="summary-card">
          <h3>Account Age</h3>
          <div className="metric">{daysSinceCreation()} days</div>
          <div className="sub-metric">Created: {formatDate(analytics.createdDate)}</div>
        </div>
        
        <div className="summary-card">
          <h3>Last Activity</h3>
          <div className="metric">{daysSinceLastActivity()} days ago</div>
          <div className="sub-metric">{formatDate(analytics.lastActivity)}</div>
        </div>
        
        <div className="summary-card">
          <h3>Total Value</h3>
          <div className="metric">${analytics.totalValueToDateInUSD || 0}</div>
          <div className="sub-metric">Lifetime value</div>
        </div>
        
        <div className="summary-card">
          <h3>Linked Accounts</h3>
          <div className="metric">{linkedAccounts.length}</div>
          <div className="sub-metric">Connected platforms</div>
        </div>

        {analytics.userDataKeyCount !== undefined && (
          <div className="summary-card">
            <h3>User Data Keys</h3>
            <div className="metric">{analytics.userDataKeyCount}</div>
            <div className="sub-metric">Data entries</div>
          </div>
        )}
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

      {analytics.userDataKeys && analytics.userDataKeys.length > 0 && (
        <div className="userdata-keys-section">
          <h3>Available User Data Keys</h3>
          <div className="keys-grid">
            {analytics.userDataKeys.map((key, index) => (
              <span key={index} className="key-badge">
                {key}
              </span>
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