using Microsoft.AspNetCore.Mvc;
using PlayFabAnalytics.Models.Responses;

namespace PlayFabAnalytics.Common.Extensions;

public static class ControllerExtensions
{
    public static IActionResult ApiResult<T>(this ControllerBase controller, ApiResponse<T> response)
    {
        if (response.Success)
        {
            return controller.Ok(response);
        }

        return controller.BadRequest(response);
    }

    public static IActionResult ApiSuccess<T>(this ControllerBase controller, T data, string? message = null)
    {
        var response = ApiResponse<T>.SuccessResult(data, message);
        return controller.Ok(response);
    }

    public static IActionResult ApiError(this ControllerBase controller, string message, List<string>? errors = null)
    {
        var response = ApiResponse<object>.ErrorResult(message, errors);
        return controller.BadRequest(response);
    }
}