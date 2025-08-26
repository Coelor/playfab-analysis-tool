using PlayFab;
using PlayFab.AdminModels;
using PlayFabAnalytics.Models.DTOs;
using PlayFabAnalytics.Models.Entities;
using PlayFabAnalytics.Models.Requests;
using PlayFabAnalytics.Models.Responses;
using PlayFabAnalytics.Services.Core;

namespace PlayFabAnalytics.Services.Players;

public class PlayerService : IPlayerService
{
    private readonly IPlayFabAuthService _authService;

    public PlayerService(IPlayFabAuthService authService)
    {
        _authService = authService;
    }

    public async Task<PaginatedResponse<PlayerSummaryDto>> GetAllPlayersAsync(GetPlayersRequest request)
    {
        try
        {
            // Get all available segments first
            var segmentsRequest = new GetAllSegmentsRequest();
            var segmentsResult = await PlayFabAdminAPI.GetAllSegmentsAsync(segmentsRequest);

            if (segmentsResult.Error != null)
            {
                throw new InvalidOperationException($"PlayFab Error getting segments: {segmentsResult.Error.ErrorMessage}");
            }

            var allPlayers = new List<PlayerSummaryDto>();
            var processedPlayerIds = new HashSet<string>();

            // Get players from each segment (avoid duplicates)
            if (segmentsResult.Result?.Segments != null)
            {
                foreach (var segment in segmentsResult.Result.Segments)
                {
                    if (segment.Id == null) continue;

                    var playersRequest = new GetPlayersInSegmentRequest
                    {
                        SegmentId = segment.Id,
                        MaxBatchSize = 1000
                    };

                    var playersResult = await PlayFabAdminAPI.GetPlayersInSegmentAsync(playersRequest);

                    if (playersResult.Error != null) continue;

                    if (playersResult.Result?.PlayerProfiles != null)
                    {
                        foreach (var profile in playersResult.Result.PlayerProfiles)
                        {
                            if (profile.PlayerId != null && !processedPlayerIds.Contains(profile.PlayerId))
                            {
                                processedPlayerIds.Add(profile.PlayerId);
                                var playerDto = ConvertToPlayerSummaryDto(profile);
                                
                                // Apply filtering
                                if (ShouldIncludePlayer(playerDto, request))
                                {
                                    allPlayers.Add(playerDto);
                                }
                            }
                        }
                    }
                }
            }

            // If no players found, return empty result
            if (!allPlayers.Any())
            {
                return PaginatedResponse<PlayerSummaryDto>.Create(
                    new List<PlayerSummaryDto>(), 0, request.PageNumber, request.PageSize);
            }

            // Apply pagination
            var totalCount = allPlayers.Count;
            var skip = (request.PageNumber - 1) * request.PageSize;
            var paginatedPlayers = allPlayers.Skip(skip).Take(request.PageSize).ToList();

            return PaginatedResponse<PlayerSummaryDto>.Create(
                paginatedPlayers, totalCount, request.PageNumber, request.PageSize);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to retrieve players: {ex.Message}", ex);
        }
    }

    public async Task<PlayerDto?> GetPlayerByIdAsync(string playFabId)
    {
        try
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
                throw new InvalidOperationException($"PlayFab Error: {result.Error.ErrorMessage}");
            }

            var profile = result.Result?.PlayerProfile;
            if (profile == null) return null;

            return ConvertToPlayerDto(profile);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to get player {playFabId}: {ex.Message}", ex);
        }
    }

    public async Task<UserDataResponse?> GetUserDataAsync(string playFabId, List<string>? keys = null)
    {
        try
        {
            var request = new GetUserDataRequest
            {
                PlayFabId = playFabId,
                Keys = keys
            };

            var result = await PlayFabAdminAPI.GetUserDataAsync(request);

            if (result.Error != null)
            {
                throw new InvalidOperationException($"PlayFab GetUserData Error: {result.Error.ErrorMessage}");
            }

            if (result.Result == null) return null;

            var response = new UserDataResponse
            {
                PlayFabId = playFabId,
                DataVersion = result.Result.DataVersion
            };

            if (result.Result.Data != null)
            {
                foreach (var kvp in result.Result.Data)
                {
                    response.Data[kvp.Key] = new PlayFabAnalytics.Models.Entities.UserDataRecord
                    {
                        Key = kvp.Key,
                        Value = kvp.Value.Value ?? string.Empty,
                        LastUpdated = kvp.Value.LastUpdated,
                        Permission = (uint?)kvp.Value.Permission
                    };
                }
            }

            return response;
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to get user data for {playFabId}: {ex.Message}", ex);
        }
    }

    private PlayerSummaryDto ConvertToPlayerSummaryDto(PlayerProfile profile)
    {
        return new PlayerSummaryDto
        {
            PlayFabId = profile.PlayerId ?? string.Empty,
            DisplayName = profile.DisplayName,
            LastLogin = profile.LastLogin,
            TotalValueToDateInUSD = (int?)profile.TotalValueToDateInUSD,
            LinkedAccountsCount = profile.LinkedAccounts?.Count ?? 0,
            StatisticsCount = profile.Statistics?.Count ?? 0
        };
    }

    private PlayerDto ConvertToPlayerDto(PlayFab.ServerModels.PlayerProfileModel profile)
    {
        return new PlayerDto
        {
            PlayFabId = profile.PlayerId ?? string.Empty,
            DisplayName = profile.DisplayName,
            Created = profile.Created,
            LastLogin = profile.LastLogin,
            TotalValueToDateInUSD = (int?)profile.TotalValueToDateInUSD,
            LinkedAccounts = profile.LinkedAccounts?.Select(la => la.Platform?.ToString() ?? string.Empty).ToList() ?? new List<string>(),
            Statistics = profile.Statistics?.ToDictionary(s => s.Name, s => (object)s.Value) ?? new Dictionary<string, object>()
        };
    }

    private bool ShouldIncludePlayer(PlayerSummaryDto player, GetPlayersRequest request)
    {
        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLowerInvariant();
            if (!player.PlayFabId.ToLowerInvariant().Contains(searchTerm) &&
                !(player.DisplayName?.ToLowerInvariant().Contains(searchTerm) ?? false))
            {
                return false;
            }
        }

        if (request.LastLoginAfter.HasValue && 
            (!player.LastLogin.HasValue || player.LastLogin < request.LastLoginAfter))
        {
            return false;
        }

        if (request.LastLoginBefore.HasValue && 
            (!player.LastLogin.HasValue || player.LastLogin > request.LastLoginBefore))
        {
            return false;
        }

        return true;
    }

}