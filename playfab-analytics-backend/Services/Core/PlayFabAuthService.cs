using Microsoft.Extensions.Options;
using PlayFab;
using PlayFab.AdminModels;
using PlayFab.AuthenticationModels;
using PlayFabAnalytics.Configuration;

namespace PlayFabAnalytics.Services.Core;

public class PlayFabAuthService : IPlayFabAuthService
{
    private readonly Configuration.PlayFabSettings _settings;
    private PlayFabAuthenticationContext? _cachedTitleContext;
    private DateTime _tokenExpiryTime = DateTime.MinValue;

    public PlayFabAuthService(IOptions<Configuration.PlayFabSettings> settings)
    {
        _settings = settings.Value;
        InitializePlayFabSettings();
    }

    public void InitializePlayFabSettings()
    {
        PlayFab.PlayFabSettings.staticSettings.TitleId = _settings.TitleId;
        PlayFab.PlayFabSettings.staticSettings.DeveloperSecretKey = _settings.DeveloperSecretKey;
    }

    public async Task<PlayFabAuthenticationContext> GetTitleEntityTokenAsync()
    {
        // Return cached token if still valid (with 5-minute buffer)
        if (_cachedTitleContext != null && DateTime.UtcNow < _tokenExpiryTime.AddMinutes(-5))
        {
            return _cachedTitleContext;
        }

        try
        {
            var titleEntityResult = await PlayFabAuthenticationAPI.GetEntityTokenAsync(
                new GetEntityTokenRequest());

            if (titleEntityResult.Error != null)
            {
                throw new InvalidOperationException(
                    $"Failed to get title entity token: {titleEntityResult.Error.ErrorMessage}");
            }

            _cachedTitleContext = new PlayFabAuthenticationContext
            {
                EntityToken = titleEntityResult.Result?.EntityToken,
                EntityId = titleEntityResult.Result?.Entity?.Id,
                EntityType = titleEntityResult.Result?.Entity?.Type
            };

            // Cache token for 1 hour (PlayFab tokens typically last 24 hours)
            _tokenExpiryTime = DateTime.UtcNow.AddHours(1);

            return _cachedTitleContext;
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Authentication failed: {ex.Message}", ex);
        }
    }

    public async Task<string?> GetPlayerEntityIdAsync(string playFabId)
    {
        try
        {
            var accountInfoResult = await PlayFabAdminAPI.GetUserAccountInfoAsync(
                new LookupUserAccountInfoRequest { PlayFabId = playFabId });

            if (accountInfoResult.Error != null)
            {
                throw new InvalidOperationException(
                    $"Failed to get player account info: {accountInfoResult.Error.ErrorMessage}");
            }

            return accountInfoResult.Result?.UserInfo?.TitleInfo?.TitlePlayerAccount?.Id;
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to resolve player entity ID: {ex.Message}", ex);
        }
    }
}