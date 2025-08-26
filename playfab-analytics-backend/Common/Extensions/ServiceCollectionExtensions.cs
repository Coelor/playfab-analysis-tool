using PlayFabAnalytics.Services.Analytics;
using PlayFabAnalytics.Services.Core;
using PlayFabAnalytics.Services.Files;
using PlayFabAnalytics.Services.Objects;
using PlayFabAnalytics.Services.Players;

namespace PlayFabAnalytics.Common.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddPlayFabServices(this IServiceCollection services)
    {
        // Core services
        services.AddSingleton<IPlayFabAuthService, PlayFabAuthService>();

        // Domain services
        services.AddScoped<IPlayerService, PlayerService>();
        services.AddScoped<IFileService, FileService>();
        services.AddScoped<IObjectService, ObjectService>();
        
        // Analytics services
        services.AddScoped<IPlayerAnalyticsService, PlayerAnalyticsService>();

        return services;
    }
}