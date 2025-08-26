namespace PlayFabAnalytics.Models.DTOs;

public class FileDto
{
    public string FileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public DateTime LastModified { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public string? DownloadUrl { get; set; }
    public string PlayFabId { get; set; } = string.Empty;
}

public class FilesResponseDto
{
    public string PlayFabId { get; set; } = string.Empty;
    public List<FileDto> Files { get; set; } = new();
    public int TotalFiles { get; set; }
    public long TotalSizeBytes { get; set; }
}

public class FileAnalysisDto
{
    public string FileName { get; set; } = string.Empty;
    public string PlayFabId { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public int RowCount { get; set; }
    public List<string> Headers { get; set; } = new();
    public Dictionary<string, object> Metadata { get; set; } = new();
}