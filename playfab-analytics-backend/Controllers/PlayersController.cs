using Microsoft.AspNetCore.Mvc;
using PlayFabAnalytics.Services;
using PlayFabAnalytics.Models;

namespace PlayFabAnalytics.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlayersController : ControllerBase
{
    private readonly IPlayFabService _playFabService;
    private readonly IPlayerAnalyticsService _analyticsService;

    public PlayersController(IPlayFabService playFabService, IPlayerAnalyticsService analyticsService)
    {
        _playFabService = playFabService;
        _analyticsService = analyticsService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllPlayers()
    {
        try
        {
            var players = await _playFabService.GetAllPlayersAsync();
            return Ok(players);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{playFabId}")]
    public async Task<IActionResult> GetPlayer(string playFabId)
    {
        try
        {
            var player = await _playFabService.GetPlayerByIdAsync(playFabId);
            if (player == null)
            {
                return NotFound(new { error = "Player not found" });
            }
            return Ok(player);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{playFabId}/userdata")]
    public async Task<IActionResult> GetUserData(string playFabId, [FromQuery] string? keys = null)
    {
        try
        {
            List<string>? keysList = null;
            if (!string.IsNullOrEmpty(keys))
            {
                keysList = keys.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList();
            }

            var userData = await _playFabService.GetUserDataAsync(playFabId, keysList);
            if (userData == null)
            {
                return NotFound(new { error = "Player not found or no user data available" });
            }

            return Ok(userData);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("{playFabId}/userdata")]
    public async Task<IActionResult> GetUserDataPost(string playFabId, [FromBody] UserDataRequest request)
    {
        try
        {
            var userData = await _playFabService.GetUserDataAsync(playFabId, request.Keys);
            if (userData == null)
            {
                return NotFound(new { error = "Player not found or no user data available" });
            }

            return Ok(userData);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{playFabId}/analytics")]
    public async Task<IActionResult> GetPlayerAnalytics(string playFabId)
    {
        try
        {
            var analytics = await _analyticsService.GetPlayerAnalyticsAsync(playFabId);
            return Ok(analytics);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{playFabId}/files")]
    public async Task<IActionResult> GetPlayerFiles(string playFabId)
    {
        try
        {
            var files = await _playFabService.GetPlayerFilesAsync(playFabId);
            if (files == null)
            {
                return NotFound(new { error = "Player not found or no files available" });
            }
            return Ok(files);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{playFabId}/files/{fileName}/download")]
    public async Task<IActionResult> DownloadPlayerFile(string playFabId, string fileName)
    {
        try
        {
            var fileContent = await _playFabService.DownloadPlayerFileAsync(playFabId, fileName);
            if (fileContent == null)
            {
                return NotFound(new { error = "File not found" });
            }

            // Get file info to determine content type
            var filesResponse = await _playFabService.GetPlayerFilesAsync(playFabId);
            var file = filesResponse?.Files.FirstOrDefault(f => f.FileName == fileName);
            var contentType = file?.ContentType ?? "application/octet-stream";

            return File(fileContent, contentType, fileName);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{playFabId}/objects")]
    public async Task<IActionResult> GetPlayerObjects(string playFabId)
    {
        try
        {
            var objects = await _playFabService.GetPlayerObjectsAsync(playFabId);
            if (objects == null)
            {
                return NotFound(new { error = "Player not found or no objects available" });
            }
            return Ok(objects);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

}