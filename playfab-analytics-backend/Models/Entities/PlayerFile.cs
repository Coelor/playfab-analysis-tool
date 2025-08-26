namespace PlayFabAnalytics.Models.Entities;

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

public class PlayerObject
{
    public string ObjectName { get; set; } = string.Empty;
    public object? ObjectData { get; set; }
    public DateTime? LastModified { get; set; }
}

public class PlayerObjectsResponse
{
    public string PlayFabId { get; set; } = string.Empty;
    public List<PlayerObject> Objects { get; set; } = new();
    public int TotalObjects { get; set; }
    public int ProfileVersion { get; set; }
}