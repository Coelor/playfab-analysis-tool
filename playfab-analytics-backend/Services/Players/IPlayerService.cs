using PlayFabAnalytics.Models.DTOs;
using PlayFabAnalytics.Models.Entities;
using PlayFabAnalytics.Models.Requests;
using PlayFabAnalytics.Models.Responses;

namespace PlayFabAnalytics.Services.Players;

public interface IPlayerService
{
    Task<PaginatedResponse<PlayerSummaryDto>> GetAllPlayersAsync(GetPlayersRequest request);
    Task<PlayerDto?> GetPlayerByIdAsync(string playFabId);
    Task<UserDataResponse?> GetUserDataAsync(string playFabId, List<string>? keys = null);
}