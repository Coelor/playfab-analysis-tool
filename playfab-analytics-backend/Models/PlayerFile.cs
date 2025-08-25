namespace PlayFabAnalytics.Models;

public class PlayerFile
{
    public string FileName { get; set; } = string.Empty;
    public int FileSize { get; set; }
    public DateTime LastModified { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public string DownloadUrl { get; set; } = string.Empty;
}

public class PlayerFilesResponse
{
    public string PlayFabId { get; set; } = string.Empty;
    public List<PlayerFile> Files { get; set; } = new();
    public int TotalFiles { get; set; }
    public long TotalSizeBytes { get; set; }
}