using PlayFabAnalytics.Models;

namespace PlayFabAnalytics.Services;

public interface IPlayFabService
{
    Task<List<Player>> GetAllPlayersAsync();
    Task<Player?> GetPlayerByIdAsync(string playFabId);
    Task<UserDataResponse?> GetUserDataAsync(string playFabId, List<string>? keys = null);
    Task<PlayerFilesResponse?> GetPlayerFilesAsync(string playFabId);
    Task<byte[]?> DownloadPlayerFileAsync(string playFabId, string fileName);
    Task<PlayerObjectsResponse?> GetPlayerObjectsAsync(string playFabId);
}