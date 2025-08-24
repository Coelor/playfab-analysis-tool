namespace PlayFabAnalytics.Models;

public class UserDataRecord
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public DateTime? LastUpdated { get; set; }
    public uint? Permission { get; set; }
}

public class UserDataResponse
{
    public string PlayFabId { get; set; } = string.Empty;
    public Dictionary<string, UserDataRecord> Data { get; set; } = new();
    public uint DataVersion { get; set; }
}

public class UserDataRequest
{
    public List<string>? Keys { get; set; }
}