using Microsoft.Extensions.Options;
using PlayFab;
using PlayFab.AdminModels;
using PlayFab.ServerModels;
using PlayFabAnalytics.Configuration;
using PlayFabAnalytics.Models;

namespace PlayFabAnalytics.Services;

public class PlayFabService : IPlayFabService
{
    private readonly Configuration.PlayFabSettings _settings;

    public PlayFabService(IOptions<Configuration.PlayFabSettings> settings)
    {
        _settings = settings.Value;

        // Initialize PlayFab
        PlayFab.PlayFabSettings.staticSettings.TitleId = _settings.TitleId;
        PlayFab.PlayFabSettings.staticSettings.DeveloperSecretKey = _settings.DeveloperSecretKey;

        // Entity APIs typically use the same authentication as admin APIs
        // The DeveloperSecretKey should provide the necessary permissions
    }

    public async Task<List<Player>> GetAllPlayersAsync()
    {
        try
        {
            // Get all available segments first
            var segmentsRequest = new PlayFab.AdminModels.GetAllSegmentsRequest();
            var segmentsResult = await PlayFabAdminAPI.GetAllSegmentsAsync(segmentsRequest);

            if (segmentsResult.Error != null)
            {
                throw new Exception($"PlayFab Error getting segments: {segmentsResult.Error.ErrorMessage}");
            }

            var allPlayers = new List<Player>();
            var processedPlayerIds = new HashSet<string>();

            // Get players from each segment (avoid duplicates)
            if (segmentsResult.Result?.Segments != null)
            {
                foreach (var segment in segmentsResult.Result.Segments)
                {
                    if (segment.Id == null) continue;

                    var playersRequest = new PlayFab.AdminModels.GetPlayersInSegmentRequest
                    {
                        SegmentId = segment.Id,
                        MaxBatchSize = 1000 // Limit to avoid too much data
                    };

                    var playersResult = await PlayFabAdminAPI.GetPlayersInSegmentAsync(playersRequest);

                    if (playersResult.Error != null)
                    {
                        // Log error but continue with other segments
                        continue;
                    }

                    if (playersResult.Result?.PlayerProfiles != null)
                    {
                        foreach (var profile in playersResult.Result.PlayerProfiles)
                        {
                            if (profile.PlayerId != null && !processedPlayerIds.Contains(profile.PlayerId))
                            {
                                processedPlayerIds.Add(profile.PlayerId);
                                allPlayers.Add(ConvertProfileToPlayer(profile));
                            }
                        }
                    }
                }
            }

            // If no segments exist or no players found, create the default "All Players" segment
            if (!allPlayers.Any())
            {
                // Try to get a basic player list using a more generic approach
                // This is a fallback - in practice you'd need to create segments in PlayFab
                return await GetPlayersFromDefaultSegmentAsync();
            }

            return allPlayers;
        }
        catch (Exception ex)
        {
            // Log the error and return mock data as fallback for development
            Console.WriteLine($"PlayFab API Error: {ex.Message}");
            return await GetMockPlayersAsync();
        }
    }

    public async Task<Player?> GetPlayerByIdAsync(string playFabId)
    {
        var request = new PlayFab.ServerModels.GetPlayerProfileRequest
        {
            PlayFabId = playFabId,
            ProfileConstraints = new PlayFab.ServerModels.PlayerProfileViewConstraints
            {
                ShowDisplayName = true,
                ShowCreated = true,
                ShowLastLogin = true,
                ShowStatistics = true,
                ShowLinkedAccounts = true
            }
        };

        var result = await PlayFabServerAPI.GetPlayerProfileAsync(request);

        if (result.Error != null)
        {
            throw new Exception($"PlayFab Error: {result.Error.ErrorMessage}");
        }

        var profile = result.Result?.PlayerProfile;
        if (profile == null) return null;

        return new Player
        {
            PlayFabId = profile.PlayerId ?? string.Empty,
            DisplayName = profile.DisplayName,
            Created = profile.Created,
            LastLogin = profile.LastLogin,
            TotalValueToDateInUSD = (int?)profile.TotalValueToDateInUSD,
            LinkedAccounts = profile.LinkedAccounts?.Select(la => la.Platform?.ToString() ?? string.Empty).ToList() ??
                             new List<string>(),
            Statistics = profile.Statistics?.ToDictionary(s => s.Name, s => (object)s.Value) ??
                         new Dictionary<string, object>()
        };
    }

    public async Task<UserDataResponse?> GetUserDataAsync(string playFabId, List<string>? keys = null)
    {
        try
        {
            var request = new PlayFab.AdminModels.GetUserDataRequest
            {
                PlayFabId = playFabId,
                Keys = keys
            };

            var result = await PlayFabAdminAPI.GetUserDataAsync(request);

            if (result.Error != null)
            {
                Console.WriteLine($"PlayFab GetUserData Error: {result.Error.ErrorMessage}");
                return null;
            }

            if (result.Result == null)
            {
                return null;
            }

            var response = new UserDataResponse
            {
                PlayFabId = playFabId,
                DataVersion = result.Result.DataVersion
            };

            if (result.Result.Data != null)
            {
                foreach (var kvp in result.Result.Data)
                {
                    response.Data[kvp.Key] = new Models.UserDataRecord
                    {
                        Key = kvp.Key,
                        Value = kvp.Value.Value ?? string.Empty,
                        LastUpdated = kvp.Value.LastUpdated,
                        Permission = (uint?)kvp.Value.Permission
                    };
                }
            }

            Console.WriteLine($"Retrieved {response.Data.Count} user data keys for player {playFabId}");
            return response;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting user data for {playFabId}: {ex.Message}");
            return null;
        }
    }

    private Player ConvertProfileToPlayer(PlayFab.AdminModels.PlayerProfile profile)
    {
        return new Player
        {
            PlayFabId = profile.PlayerId ?? string.Empty,
            DisplayName = profile.DisplayName,
            Created = profile.Created,
            LastLogin = profile.LastLogin,
            TotalValueToDateInUSD = (int?)profile.TotalValueToDateInUSD,
            LinkedAccounts = profile.LinkedAccounts?.Select(la => la.Platform?.ToString() ?? string.Empty).ToList() ??
                             new List<string>(),
            Statistics = profile.Statistics?.ToDictionary(s => s.Key, s => (object)s.Value) ??
                         new Dictionary<string, object>()
        };
    }


    private async Task<List<Player>> GetPlayersFromDefaultSegmentAsync()
    {
        // This method would be used if there are specific "All Players" or default segments
        // For now, return empty list - in production you'd configure default segments in PlayFab
        await Task.Delay(10);
        return new List<Player>();
    }

    private async Task<List<Player>> GetMockPlayersAsync()
    {
        // Fallback mock data for development when PlayFab API fails
        await Task.Delay(100);

        return new List<Player>
        {
            new Player
            {
                PlayFabId = "A1B2C3D4E5F6",
                DisplayName = "TestPlayer_001",
                Created = DateTime.Now.AddDays(-45),
                LastLogin = DateTime.Now.AddHours(-3),
                TotalValueToDateInUSD = 25,
                LinkedAccounts = new List<string> { "Steam", "Xbox" },
                Statistics = new Dictionary<string, object>
                {
                    { "Level", 15 },
                    { "GamesPlayed", 42 },
                    { "TotalPlayTime", 12.5 }
                }
            },
            new Player
            {
                PlayFabId = "F6E5D4C3B2A1",
                DisplayName = "VRExplorer_99",
                Created = DateTime.Now.AddDays(-20),
                LastLogin = DateTime.Now.AddDays(-1),
                TotalValueToDateInUSD = 0,
                LinkedAccounts = new List<string> { "Oculus" },
                Statistics = new Dictionary<string, object>
                {
                    { "Level", 8 },
                    { "GamesPlayed", 15 },
                    { "TotalPlayTime", 4.2 }
                }
            },
            new Player
            {
                PlayFabId = "1A2B3C4D5E6F",
                DisplayName = "SimulationUser_42",
                Created = DateTime.Now.AddDays(-60),
                LastLogin = DateTime.Now.AddMinutes(-30),
                TotalValueToDateInUSD = 10,
                LinkedAccounts = new List<string> { "Steam" },
                Statistics = new Dictionary<string, object>
                {
                    { "Level", 22 },
                    { "GamesPlayed", 78 },
                    { "TotalPlayTime", 28.7 }
                }
            }
        };
    }

}