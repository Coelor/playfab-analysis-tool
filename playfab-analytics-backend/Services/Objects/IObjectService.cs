using PlayFabAnalytics.Models.DTOs;

namespace PlayFabAnalytics.Services.Objects;

public interface IObjectService
{
    Task<ObjectsResponseDto?> GetPlayerObjectsAsync(string playFabId);
}