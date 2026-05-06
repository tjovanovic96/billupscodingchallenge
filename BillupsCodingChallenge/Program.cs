using System.Text.Json.Serialization;
using BillupsCodingChallenge.API.Middleware;
using BillupsCodingChallenge.Application.Interfaces;
using BillupsCodingChallenge.Application.Services;
using BillupsCodingChallenge.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Polly;
using Polly.Extensions.Http;

var builder = WebApplication.CreateBuilder(args);

const string CorsPolicyName = "AllowBoohma";

builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicyName, policy =>
    {
        policy.WithOrigins("https://codechallenge.boohma.com")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddHttpClient<IRandomApiService, RandomApiService>(client =>
{
    client.BaseAddress = new Uri("https://codechallenge.boohma.com/");
})
.AddPolicyHandler((services, _) =>
    HttpPolicyExtensions
        .HandleTransientHttpError()   // HttpRequestException, 5xx, 408
        .WaitAndRetryAsync(
            retryCount: 3,
            sleepDurationProvider: attempt => TimeSpan.FromSeconds(Math.Pow(2, attempt)),
            onRetry: (outcome, delay, attempt, _) =>
                services
                    .GetRequiredService<ILogger<RandomApiService>>()
                    .LogWarning(
                        "Random API transient failure on attempt {Attempt} ({Reason}). Retrying in {Delay:F1}s.",
                        attempt,
                        outcome.Exception?.Message ?? $"HTTP {(int)outcome.Result!.StatusCode}",
                        delay.TotalSeconds)));

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IGameService, GameService>();
builder.Services.AddScoped<IPlayService, PlayService>();
builder.Services.AddScoped<IScoreboardService, ScoreboardService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.Migrate();
}

app.UseMiddleware<RequestLoggingMiddleware>();
app.UseMiddleware<ErrorHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors(CorsPolicyName);
app.MapControllers();

app.Run();

public partial class Program { }
