using Microsoft.AspNetCore.Mvc;
using PlayFabAnalytics.Services.Players;
using PlayFabAnalytics.Services.Files;
using PlayFabAnalytics.Services.Objects;
using PlayFabAnalytics.Services.Analytics;
using PlayFabAnalytics.Models.Requests;
using PlayFabAnalytics.Common.Extensions;

namespace PlayFabAnalytics.Controllers;

/// <summary>
/// Read-only controller for PlayFab player data analytics.
/// Provides access to player information, user data, files, and objects.
/// No data modification endpoints are exposed.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class PlayersController : ControllerBase
{
    private readonly IPlayerService _playerService;
    private readonly IFileService _fileService;
    private readonly IObjectService _objectService;
    private readonly IPlayerAnalyticsService _analyticsService;

    public PlayersController(
        IPlayerService playerService,
        IFileService fileService,
        IObjectService objectService,
        IPlayerAnalyticsService analyticsService)
    {
        _playerService = playerService;
        _fileService = fileService;
        _objectService = objectService;
        _analyticsService = analyticsService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllPlayers([FromQuery] GetPlayersRequest request)
    {
        var result = await _playerService.GetAllPlayersAsync(request);
        return this.ApiSuccess(result);
    }

    [HttpGet("{playFabId}")]
    public async Task<IActionResult> GetPlayer(string playFabId)
    {
        var player = await _playerService.GetPlayerByIdAsync(playFabId);
        if (player == null)
        {
            return NotFound(this.ApiError("Player not found"));
        }
        return this.ApiSuccess(player);
    }

    [HttpGet("{playFabId}/userdata")]
    public async Task<IActionResult> GetUserData(string playFabId, [FromQuery] string? keys = null)
    {
        List<string>? keysList = null;
        if (!string.IsNullOrEmpty(keys))
        {
            keysList = keys.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList();
        }

        var userData = await _playerService.GetUserDataAsync(playFabId, keysList);
        if (userData == null)
        {
            return NotFound(this.ApiError("Player not found or no user data available"));
        }

        return this.ApiSuccess(userData);
    }


    [HttpGet("{playFabId}/analytics")]
    public async Task<IActionResult> GetPlayerAnalytics(string playFabId)
    {
        var analytics = await _analyticsService.GetPlayerAnalyticsAsync(playFabId);
        return this.ApiSuccess(analytics);
    }

    [HttpGet("{playFabId}/files")]
    public async Task<IActionResult> GetPlayerFiles(string playFabId)
    {
        var files = await _fileService.GetPlayerFilesAsync(playFabId);
        if (files == null)
        {
            return NotFound(this.ApiError("Player not found or no files available"));
        }
        return this.ApiSuccess(files);
    }

    [HttpGet("{playFabId}/files/{fileName}/download")]
    public async Task<IActionResult> DownloadPlayerFile(string playFabId, string fileName)
    {
        var fileContent = await _fileService.DownloadPlayerFileAsync(playFabId, fileName);
        if (fileContent == null)
        {
            return NotFound(this.ApiError("File not found"));
        }

        // Get file info to determine content type
        var filesResponse = await _fileService.GetPlayerFilesAsync(playFabId);
        var file = filesResponse?.Files.FirstOrDefault(f => f.FileName == fileName);
        var contentType = file?.ContentType ?? "application/octet-stream";

        return File(fileContent, contentType, fileName);
    }

    [HttpGet("{playFabId}/files/{fileName}/analyze")]
    public async Task<IActionResult> AnalyzePlayerFile(string playFabId, string fileName)
    {
        var analysis = await _fileService.AnalyzeFileAsync(playFabId, fileName);
        if (analysis == null)
        {
            return NotFound(this.ApiError("File not found"));
        }
        return this.ApiSuccess(analysis);
    }

    [HttpGet("{playFabId}/objects")]
    public async Task<IActionResult> GetPlayerObjects(string playFabId)
    {
        var objects = await _objectService.GetPlayerObjectsAsync(playFabId);
        if (objects == null)
        {
            return NotFound(this.ApiError("Player not found or no objects available"));
        }
        return this.ApiSuccess(objects);
    }

}