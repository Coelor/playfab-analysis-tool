using PlayFabAnalytics.Models.Responses;
using System.Net;
using System.Text.Json;

namespace PlayFabAnalytics.Middleware;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = exception switch
        {
            InvalidOperationException => new ApiResponse<object>
            {
                Success = false,
                Message = exception.Message,
                Errors = new List<string> { exception.Message }
            },
            ArgumentException => new ApiResponse<object>
            {
                Success = false,
                Message = "Invalid request parameters",
                Errors = new List<string> { exception.Message }
            },
            UnauthorizedAccessException => new ApiResponse<object>
            {
                Success = false,
                Message = "Access denied",
                Errors = new List<string> { "You don't have permission to access this resource" }
            },
            _ => new ApiResponse<object>
            {
                Success = false,
                Message = "An error occurred while processing your request",
                Errors = new List<string> { "Internal server error" }
            }
        };

        context.Response.StatusCode = exception switch
        {
            InvalidOperationException => (int)HttpStatusCode.BadRequest,
            ArgumentException => (int)HttpStatusCode.BadRequest,
            UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,
            _ => (int)HttpStatusCode.InternalServerError
        };

        var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(jsonResponse);
    }
}