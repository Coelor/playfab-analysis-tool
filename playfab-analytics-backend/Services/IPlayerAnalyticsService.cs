namespace PlayFabAnalytics.Services;

public interface IPlayerAnalyticsService
{
    Task<Dictionary<string, object>> GetPlayerAnalyticsAsync(string playFabId);
}