namespace PlayFabAnalytics.Models.Requests;

public class GetPlayersRequest
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 50;
    public string? SearchTerm { get; set; }
    public DateTime? CreatedAfter { get; set; }
    public DateTime? CreatedBefore { get; set; }
    public DateTime? LastLoginAfter { get; set; }
    public DateTime? LastLoginBefore { get; set; }
    public List<string>? LinkedAccounts { get; set; }
}