using PlayFab;

namespace PlayFabAnalytics.Services.Core;

public interface IPlayFabAuthService
{
    Task<PlayFabAuthenticationContext> GetTitleEntityTokenAsync();
    Task<string?> GetPlayerEntityIdAsync(string playFabId);
    void InitializePlayFabSettings();
}