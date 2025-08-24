# PlayFab Analytics Tool

A .NET Web API application for analyzing PlayFab player data and transform logs from simulation scenes.

## Project Structure

```
PlayFabAnalytics/
├── Controllers/          # API endpoints
│   └── PlayersController.cs
├── Services/            # Business logic and PlayFab integration
│   ├── IPlayFabService.cs
│   ├── PlayFabService.cs
│   ├── IPlayerAnalyticsService.cs
│   └── PlayerAnalyticsService.cs
├── Models/              # Data models
│   ├── Player.cs
│   └── PlayerFile.cs
├── Configuration/       # App settings
│   └── PlayFabSettings.cs
└── Program.cs          # Application entry point
```

## Setup Instructions

1. **Configure PlayFab Settings**:
   - Open `appsettings.json`
   - Replace placeholders with your PlayFab credentials:
     - `TitleId`: Your PlayFab Title ID
     - `SecretKey`: Your PlayFab Secret Key
     - `DeveloperSecretKey`: Your PlayFab Developer Secret Key

2. **Install Dependencies**:
   ```bash
   dotnet restore
   ```

3. **Run the Application**:
   ```bash
   dotnet run
   ```

4. **Access Swagger UI**:
   - Navigate to `https://localhost:5001/swagger`
   - Test the API endpoints

## API Endpoints

- `GET /api/players` - Get all players
- `GET /api/players/{id}` - Get specific player data
- `GET /api/players/{id}/files` - Get player's uploaded files
- `GET /api/players/{id}/files/{fileName}` - Get file content
- `GET /api/players/{id}/analytics` - Get player analytics summary

## Transform Log Format

The application expects transform logs in JSON or CSV format containing:
- Scene name
- Timestamp
- Position (X, Y, Z)
- Rotation (X, Y, Z)
- Velocity (optional)
- Acceleration (optional)
- Controller type

## Next Steps

1. Configure your PlayFab credentials
2. Test the API endpoints
3. Implement frontend for data visualization
4. Add more analytics features as needed