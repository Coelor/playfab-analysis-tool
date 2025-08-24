# PlayFab Analytics Frontend

A React TypeScript dashboard for visualizing PlayFab player data and analytics.

## Features

- **Player List View**: Browse all players with basic information
- **Player Details**: Detailed view with tabs for:
  - Basic player information
  - User data stored in PlayFab
  - Analytics with interactive charts
- **Real-time Data**: Direct connection to PlayFab Analytics API
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Interactive Charts**: Data visualization using Chart.js

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- PlayFab Analytics Backend running on `http://localhost:5000`

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The application will open at `http://localhost:3000`

## Backend Requirements

Make sure the PlayFab Analytics .NET backend is running on `http://localhost:5000` with the following endpoints available:

- `GET /api/players` - Get all players
- `GET /api/players/{id}` - Get player details
- `GET /api/players/{id}/userdata` - Get player user data
- `GET /api/players/{id}/analytics` - Get player analytics

## Project Structure

```
src/
├── components/           # React components
│   ├── PlayerList.tsx   # Player listing component
│   ├── PlayerDetails.tsx # Player details component
│   └── PlayerAnalyticsChart.tsx # Charts component
├── services/            # API services
│   └── api.ts          # Backend API calls
├── types/              # TypeScript type definitions
│   └── Player.ts       # Player data types
├── App.tsx             # Main application component
└── index.tsx           # Application entry point
```

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Router** - Navigation
- **Chart.js** - Data visualization
- **Axios** - HTTP requests
- **CSS3** - Styling with modern features