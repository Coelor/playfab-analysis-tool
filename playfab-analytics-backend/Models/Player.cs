namespace PlayFabAnalytics.Models;

public class Player
{
    public string PlayFabId { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public DateTime? Created { get; set; }
    public DateTime? LastLogin { get; set; }
    public int? TotalValueToDateInUSD { get; set; }
    public List<string> LinkedAccounts { get; set; } = new();
    public Dictionary<string, object> Statistics { get; set; } = new();
}