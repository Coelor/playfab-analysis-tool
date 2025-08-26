using PlayFabAnalytics.Models.DTOs;

namespace PlayFabAnalytics.Services.Files;

public interface IFileService
{
    Task<FilesResponseDto?> GetPlayerFilesAsync(string playFabId);
    Task<byte[]?> DownloadPlayerFileAsync(string playFabId, string fileName);
    Task<FileAnalysisDto?> AnalyzeFileAsync(string playFabId, string fileName);
}