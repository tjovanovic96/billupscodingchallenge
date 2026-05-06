using Microsoft.AspNetCore.Mvc;

namespace BillupsCodingChallenge.API.Middleware;

public class ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception for {Method} {Path}", context.Request.Method, context.Request.Path);

            var (statusCode, title) = ex switch
            {
                HttpRequestException => (StatusCodes.Status503ServiceUnavailable, "Random number service is unavailable."),
                InvalidOperationException => (StatusCodes.Status502BadGateway, "Invalid response from random number service."),
                _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred.")
            };

            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/problem+json";
            await context.Response.WriteAsJsonAsync(new ProblemDetails
            {
                Status = statusCode,
                Title = title,
                Detail = ex.Message
            });
        }
    }
}
