using PlayFab;
using PlayFab.DataModels;
using PlayFabAnalytics.Models.DTOs;
using PlayFabAnalytics.Services.Core;

namespace PlayFabAnalytics.Services.Files;

public class FileService : IFileService
{
    private readonly IPlayFabAuthService _authService;

    public FileService(IPlayFabAuthService authService)
    {
        _authService = authService;
    }

    public async Task<FilesResponseDto?> GetPlayerFilesAsync(string playFabId)
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

            // Get files for the player using the title_player_account entity type
            var getFilesRequest = new GetFilesRequest
            {
                Entity = new EntityKey
                {
                    Id = entityId,
                    Type = "title_player_account"
                }
            };

            var filesResult = await PlayFabDataAPI.GetFilesAsync(getFilesRequest, authContext);

            if (filesResult.Error != null)
            {
                // Return empty response instead of null to indicate no files
                return new FilesResponseDto
                {
                    PlayFabId = playFabId,
                    Files = new List<FileDto>(),
                    TotalFiles = 0,
                    TotalSizeBytes = 0
                };
            }

            var response = new FilesResponseDto
            {
                PlayFabId = playFabId
            };

            // Process the file metadata
            if (filesResult.Result?.Metadata != null)
            {
                foreach (var fileMetadata in filesResult.Result.Metadata)
                {
                    response.Files.Add(new FileDto
                    {
                        FileName = fileMetadata.Key ?? string.Empty,
                        FileSize = fileMetadata.Value?.Size ?? 0,
                        LastModified = fileMetadata.Value?.LastModified ?? DateTime.MinValue,
                        ContentType = "application/octet-stream", // Default content type
                        DownloadUrl = fileMetadata.Value?.DownloadUrl ?? string.Empty,
                        PlayFabId = playFabId
                    });
                }
            }

            response.TotalFiles = response.Files.Count;
            response.TotalSizeBytes = response.Files.Sum(f => f.FileSize);

            return response;
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to get player files for {playFabId}: {ex.Message}", ex);
        }
    }

    public async Task<byte[]?> DownloadPlayerFileAsync(string playFabId, string fileName)
    {
        try
        {
            // Get the file info first to get the download URL
            var filesResponse = await GetPlayerFilesAsync(playFabId);
            var file = filesResponse?.Files.FirstOrDefault(f => f.FileName == fileName);
            
            if (file == null || string.IsNullOrEmpty(file.DownloadUrl))
            {
                return null;
            }

            // Download the file from the CDN URL
            using var httpClient = new HttpClient();
            var response = await httpClient.GetAsync(file.DownloadUrl);
            
            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            return await response.Content.ReadAsByteArrayAsync();
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to download file {fileName} for player {playFabId}: {ex.Message}", ex);
        }
    }

    public async Task<FileAnalysisDto?> AnalyzeFileAsync(string playFabId, string fileName)
    {
        try
        {
            var fileContent = await DownloadPlayerFileAsync(playFabId, fileName);
            if (fileContent == null) return null;

            var filesResponse = await GetPlayerFilesAsync(playFabId);
            var file = filesResponse?.Files.FirstOrDefault(f => f.FileName == fileName);
            if (file == null) return null;

            var analysis = new FileAnalysisDto
            {
                FileName = fileName,
                PlayFabId = playFabId,
                FileSize = file.FileSize,
                ContentType = file.ContentType
            };

            // If it's a CSV file, parse the headers and row count
            if (fileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase) ||
                file.ContentType.Contains("csv", StringComparison.OrdinalIgnoreCase))
            {
                var csvContent = System.Text.Encoding.UTF8.GetString(fileContent);
                var lines = csvContent.Split('\n', StringSplitOptions.RemoveEmptyEntries);
                
                analysis.RowCount = Math.Max(0, lines.Length - 1); // Subtract header row
                
                if (lines.Length > 0)
                {
                    analysis.Headers = lines[0].Split(',').Select(h => h.Trim()).ToList();
                }

                analysis.Metadata["TotalLines"] = lines.Length;
                analysis.Metadata["HasHeaders"] = lines.Length > 0;
            }

            return analysis;
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to analyze file {fileName} for player {playFabId}: {ex.Message}", ex);
        }
    }
}