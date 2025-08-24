namespace PlayFabAnalytics.Services;

public class PlayerAnalyticsService : IPlayerAnalyticsService
{
    private readonly IPlayFabService _playFabService;

    public PlayerAnalyticsService(IPlayFabService playFabService)
    {
        _playFabService = playFabService;
    }

    public async Task<Dictionary<string, object>> GetPlayerAnalyticsAsync(string playFabId)
    {
        var analytics = new Dictionary<string, object>();
        
        try
        {
            var player = await _playFabService.GetPlayerByIdAsync(playFabId);
            
            if (player != null)
            {
                analytics["PlayFabId"] = player.PlayFabId;
                analytics["DisplayName"] = player.DisplayName ?? "N/A";
                analytics["LastActivity"] = player.LastLogin ?? DateTime.MinValue;
                analytics["CreatedDate"] = player.Created ?? DateTime.MinValue;
                analytics["TotalValueToDateInUSD"] = player.TotalValueToDateInUSD ?? 0;
                analytics["LinkedAccounts"] = player.LinkedAccounts;
                analytics["Statistics"] = player.Statistics;

                // Try to get some user data for additional analytics
                var userData = await _playFabService.GetUserDataAsync(playFabId);
                if (userData?.Data != null)
                {
                    analytics["UserDataKeyCount"] = userData.Data.Count;
                    analytics["UserDataKeys"] = userData.Data.Keys.ToList();
                }
            }
            else
            {
                analytics["Error"] = "Player not found";
            }
        }
        catch (Exception ex)
        {
            analytics["Error"] = ex.Message;
        }
        
        return analytics;
    }
}