using System.Diagnostics;

namespace BillupsCodingChallenge.API.Middleware;

public class RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var sw = Stopwatch.StartNew();

        logger.LogInformation("Incoming {Method} {Path}{Query}",
            context.Request.Method,
            context.Request.Path,
            context.Request.QueryString);

        await next(context);

        sw.Stop();

        logger.LogInformation("Completed {Method} {Path} → {StatusCode} in {ElapsedMs}ms",
            context.Request.Method,
            context.Request.Path,
            context.Response.StatusCode,
            sw.ElapsedMilliseconds);
    }
}
