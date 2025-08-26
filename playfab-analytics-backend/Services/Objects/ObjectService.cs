using PlayFab;
using PlayFab.DataModels;
using PlayFabAnalytics.Models.DTOs;
using PlayFabAnalytics.Services.Core;

namespace PlayFabAnalytics.Services.Objects;

public class ObjectService : IObjectService
{
    private readonly IPlayFabAuthService _authService;

    public ObjectService(IPlayFabAuthService authService)
    {
        _authService = authService;
    }

    public async Task<ObjectsResponseDto?> GetPlayerObjectsAsync(string playFabId)
    {
        try
        {
            // Get player entity ID
            var entityId = await _authService.GetPlayerEntityIdAsync(playFabId);
            if (string.IsNullOrEmpty(entityId))
            {
                throw new InvalidOperationException("Could not resolve player entity ID");
            }

            // Get title entity token for authentication
            var authContext = await _authService.GetTitleEntityTokenAsync();

            // Get objects for the player using the title_player_account entity type
            var getObjectsRequest = new GetObjectsRequest
            {
                Entity = new EntityKey
                {
                    Id = entityId,
                    Type = "title_player_account"
                },
                EscapeObject = false
            };

            var objectsResult = await PlayFabDataAPI.GetObjectsAsync(getObjectsRequest, authContext);

            if (objectsResult.Error != null)
            {
                // Return empty response instead of null to indicate no objects
                return new ObjectsResponseDto
                {
                    PlayFabId = playFabId,
                    Objects = new List<ObjectDto>(),
                    TotalObjects = 0,
                    ProfileVersion = 0
                };
            }

            var response = new ObjectsResponseDto
            {
                PlayFabId = playFabId,
                ProfileVersion = objectsResult.Result?.ProfileVersion ?? 0
            };

            // Process the objects
            if (objectsResult.Result?.Objects != null)
            {
                foreach (var obj in objectsResult.Result.Objects)
                {
                    response.Objects.Add(new ObjectDto
                    {
                        ObjectName = obj.Key ?? string.Empty,
                        ObjectData = obj.Value?.DataObject,
                        LastModified = null, // Objects API doesn't provide last modified date
                        PlayFabId = playFabId
                    });
                }
            }

            response.TotalObjects = response.Objects.Count;

            return response;
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to get player objects for {playFabId}: {ex.Message}", ex);
        }
    }
}