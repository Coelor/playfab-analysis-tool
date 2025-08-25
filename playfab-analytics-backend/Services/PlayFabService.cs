using Microsoft.Extensions.Options;
using PlayFab;
using PlayFab.AdminModels;
using PlayFab.ServerModels;
using PlayFab.AuthenticationModels;
using PlayFab.DataModels;
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

    public async Task<PlayerFilesResponse?> GetPlayerFilesAsync(string playFabId)
    {
        try
        {
            // Resolve the player's entity ID using their PlayFab ID
            var accountInfoResult = await PlayFabAdminAPI.GetUserAccountInfoAsync(
                new PlayFab.AdminModels.LookupUserAccountInfoRequest { PlayFabId = playFabId });
            if (accountInfoResult.Error != null ||
                accountInfoResult.Result?.UserInfo?.TitleInfo?.TitlePlayerAccount?.Id == null)
            {
                Console.WriteLine(
                    $"PlayFab GetUserAccountInfo Error: {accountInfoResult.Error?.ErrorMessage ?? "Missing TitlePlayerAccount"}");
                return null;
            }

            var entityId = accountInfoResult.Result.UserInfo.TitleInfo.TitlePlayerAccount.Id;

            // Acquire an entity token for the title entity (not the player)
            var titleEntityResult = await PlayFabAuthenticationAPI.GetEntityTokenAsync(
                new PlayFab.AuthenticationModels.GetEntityTokenRequest());

            if (titleEntityResult.Error != null)
            {
                Console.WriteLine($"PlayFab Title Entity Token Error: {titleEntityResult.Error.ErrorMessage}");
                return null;
            }

            var authContext = new PlayFab.PlayFabAuthenticationContext
            {
                EntityToken = titleEntityResult.Result?.EntityToken,
                EntityId = titleEntityResult.Result?.Entity?.Id,
                EntityType = titleEntityResult.Result?.Entity?.Type
            };

            // Now get the files for the player using the title_player_account entity type
            var getFilesRequest = new PlayFab.DataModels.GetFilesRequest
            {
                Entity = new PlayFab.DataModels.EntityKey
                {
                    Id = entityId,
                    Type = "title_player_account"
                }
            };

            var filesResult = await PlayFabDataAPI.GetFilesAsync(getFilesRequest, authContext);

            if (filesResult.Error != null)
            {
                Console.WriteLine($"PlayFab GetFiles Error: {filesResult.Error.ErrorMessage}");

                // Return empty response instead of null to indicate no files
                return new PlayerFilesResponse
                {
                    PlayFabId = playFabId,
                    Files = new List<PlayerFile>(),
                    TotalFiles = 0,
                    TotalSizeBytes = 0
                };
            }

            var response = new PlayerFilesResponse
            {
                PlayFabId = playFabId
            };

            // Process the file metadata
            if (filesResult.Result?.Metadata != null)
            {
                foreach (var fileMetadata in filesResult.Result.Metadata)
                {
                    response.Files.Add(new PlayerFile
                    {
                        FileName = fileMetadata.Key ?? string.Empty,
                        FileSize = fileMetadata.Value?.Size ?? 0,
                        LastModified = fileMetadata.Value?.LastModified ?? DateTime.MinValue,
                        ContentType = "application/octet-stream", // Default content type, as ContentType may not be available
                        DownloadUrl = fileMetadata.Value?.DownloadUrl ?? string.Empty
                    });
                }
            }

            response.TotalFiles = response.Files.Count;
            response.TotalSizeBytes = response.Files.Sum(f => f.FileSize);

            Console.WriteLine($"Retrieved {response.TotalFiles} files for player {playFabId}");
            return response;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting player files for {playFabId}: {ex.Message}");
            return null;
        }
    }

    public async Task<byte[]?> DownloadPlayerFileAsync(string playFabId, string fileName)
    {
        try
        {
            await Task.Delay(10); // Temporary to avoid async warning
            Console.WriteLine($"File download not yet implemented for {fileName} from player {playFabId}");
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error downloading file {fileName} for player {playFabId}: {ex.Message}");
            return null;
        }
    }

    public async Task<PlayerObjectsResponse?> GetPlayerObjectsAsync(string playFabId)
    {
        try
        {
            // Resolve the player's entity ID using their PlayFab ID
            var accountInfoResult = await PlayFabAdminAPI.GetUserAccountInfoAsync(
                new PlayFab.AdminModels.LookupUserAccountInfoRequest { PlayFabId = playFabId });
            if (accountInfoResult.Error != null ||
                accountInfoResult.Result?.UserInfo?.TitleInfo?.TitlePlayerAccount?.Id == null)
            {
                Console.WriteLine(
                    $"PlayFab GetUserAccountInfo Error: {accountInfoResult.Error?.ErrorMessage ?? "Missing TitlePlayerAccount"}");
                return null;
            }

            var entityId = accountInfoResult.Result.UserInfo.TitleInfo.TitlePlayerAccount.Id;

            // Acquire an entity token for the title entity (not the player)
            var titleEntityResult = await PlayFabAuthenticationAPI.GetEntityTokenAsync(
                new PlayFab.AuthenticationModels.GetEntityTokenRequest());

            if (titleEntityResult.Error != null)
            {
                Console.WriteLine($"PlayFab Title Entity Token Error: {titleEntityResult.Error.ErrorMessage}");
                return null;
            }

            var authContext = new PlayFab.PlayFabAuthenticationContext
            {
                EntityToken = titleEntityResult.Result?.EntityToken,
                EntityId = titleEntityResult.Result?.Entity?.Id,
                EntityType = titleEntityResult.Result?.Entity?.Type
            };

            // Get objects for the player using the title_player_account entity type
            var getObjectsRequest = new PlayFab.DataModels.GetObjectsRequest
            {
                Entity = new PlayFab.DataModels.EntityKey
                {
                    Id = entityId,
                    Type = "title_player_account"
                },
                EscapeObject = false
            };

            var objectsResult = await PlayFabDataAPI.GetObjectsAsync(getObjectsRequest, authContext);

            if (objectsResult.Error != null)
            {
                Console.WriteLine($"PlayFab GetObjects Error: {objectsResult.Error.ErrorMessage}");

                // Return empty response instead of null to indicate no objects
                return new PlayerObjectsResponse
                {
                    PlayFabId = playFabId,
                    Objects = new List<PlayerObject>(),
                    TotalObjects = 0,
                    ProfileVersion = 0
                };
            }

            var response = new PlayerObjectsResponse
            {
                PlayFabId = playFabId,
                ProfileVersion = objectsResult.Result?.ProfileVersion ?? 0
            };

            // Process the objects
            if (objectsResult.Result?.Objects != null)
            {
                foreach (var obj in objectsResult.Result.Objects)
                {
                    response.Objects.Add(new PlayerObject
                    {
                        ObjectName = obj.Key ?? string.Empty,
                        ObjectData = obj.Value?.DataObject,
                        LastModified = null // Objects API doesn't provide last modified date
                    });
                }
            }

            response.TotalObjects = response.Objects.Count;

            Console.WriteLine($"Retrieved {response.TotalObjects} objects for player {playFabId}");
            return response;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting player objects for {playFabId}: {ex.Message}");
            return null;
        }
    }


}