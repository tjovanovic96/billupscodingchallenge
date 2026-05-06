using System.Text.Json.Serialization;
using BillupsCodingChallenge.API.Middleware;
using BillupsCodingChallenge.Application.Interfaces;
using BillupsCodingChallenge.Application.Services;
using BillupsCodingChallenge.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

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
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IGameService, GameService>();
builder.Services.AddScoped<IPlayService, PlayService>();
builder.Services.AddScoped<IScoreboardService, ScoreboardService>();

var app = builder.Build();

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
