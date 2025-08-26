namespace PlayFabAnalytics.Services.Analytics;

public interface IPlayerAnalyticsService
{
    Task<Dictionary<string, object>> GetPlayerAnalyticsAsync(string playFabId);
}