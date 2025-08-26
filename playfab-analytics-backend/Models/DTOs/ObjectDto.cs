namespace PlayFabAnalytics.Models.DTOs;

public class ObjectDto
{
    public string ObjectName { get; set; } = string.Empty;
    public object? ObjectData { get; set; }
    public DateTime? LastModified { get; set; }
    public string PlayFabId { get; set; } = string.Empty;
}

public class ObjectsResponseDto
{
    public string PlayFabId { get; set; } = string.Empty;
    public List<ObjectDto> Objects { get; set; } = new();
    public int TotalObjects { get; set; }
    public int ProfileVersion { get; set; }
}