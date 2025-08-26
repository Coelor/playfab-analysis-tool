using PlayFabAnalytics.Services.Players;
using PlayFabAnalytics.Services.Files;
using PlayFabAnalytics.Services.Objects;

namespace PlayFabAnalytics.Services.Analytics;

public class PlayerAnalyticsService : IPlayerAnalyticsService
{
    private readonly IPlayerService _playerService;
    private readonly IFileService _fileService;
    private readonly IObjectService _objectService;

    public PlayerAnalyticsService(
        IPlayerService playerService,
        IFileService fileService,
        IObjectService objectService)
    {
        _playerService = playerService;
        _fileService = fileService;
        _objectService = objectService;
    }

    public async Task<Dictionary<string, object>> GetPlayerAnalyticsAsync(string playFabId)
    {
        var analytics = new Dictionary<string, object>();
        
        try
        {
            var player = await _playerService.GetPlayerByIdAsync(playFabId);
            
            if (player != null)
            {
                // Basic player info
                analytics["PlayFabId"] = player.PlayFabId;
                analytics["DisplayName"] = player.DisplayName ?? "N/A";
                analytics["LastActivity"] = player.LastLogin ?? DateTime.MinValue;
                analytics["CreatedDate"] = player.Created ?? DateTime.MinValue;
                analytics["TotalValueToDateInUSD"] = player.TotalValueToDateInUSD ?? 0;
                analytics["LinkedAccounts"] = player.LinkedAccounts;
                analytics["Statistics"] = player.Statistics;

                // Enhanced analytics with new services
                var userData = await _playerService.GetUserDataAsync(playFabId);
                if (userData?.Data != null)
                {
                    analytics["UserDataKeyCount"] = userData.Data.Count;
                    analytics["UserDataKeys"] = userData.Data.Keys.ToList();
                }

                // File analytics
                var files = await _fileService.GetPlayerFilesAsync(playFabId);
                if (files != null)
                {
                    analytics["FileCount"] = files.TotalFiles;
                    analytics["TotalFileSizeBytes"] = files.TotalSizeBytes;
                    analytics["FileTypes"] = files.Files
                        .GroupBy(f => Path.GetExtension(f.FileName).ToLowerInvariant())
                        .ToDictionary(g => g.Key, g => g.Count());
                }

                // Object analytics
                var objects = await _objectService.GetPlayerObjectsAsync(playFabId);
                if (objects != null)
                {
                    analytics["ObjectCount"] = objects.TotalObjects;
                    analytics["ProfileVersion"] = objects.ProfileVersion;
                    analytics["ObjectNames"] = objects.Objects.Select(o => o.ObjectName).ToList();
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