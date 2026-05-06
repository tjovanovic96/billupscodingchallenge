using System.Net;
using System.Net.Http.Json;
using BillupsCodingChallenge.Application.Models;
using BillupsCodingChallenge.Infrastructure.Data;
using Moq;
using Xunit;

namespace BillupsCodingChallenge.IntegrationTests;

public class GameControllerTests : IClassFixture<GameApiFactory>, IAsyncLifetime
{
    private readonly GameApiFactory _factory;
    private readonly HttpClient _client;

    private record ChoiceResponse(int Id, string Name);
    private record PlayResultResponse(string Username, string Results, ChoiceResponse Player, ChoiceResponse Computer);
    private record ScoreboardEntryResponse(int Id, string Username, int PlayerChoiceId, int ComputerChoiceId, string Result, DateTime PlayedAtUtc);

    public GameControllerTests(GameApiFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    public async Task InitializeAsync()
    {
        _factory.RandomApiMock.Invocations.Clear();
        await _factory.ResetDatabaseAsync();
    }

    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task GetChoices_Returns5Items()
    {
        var response = await _client.GetAsync("/choices");

        response.EnsureSuccessStatusCode();
        var choices = await response.Content.ReadFromJsonAsync<List<ChoiceResponse>>();

        Assert.NotNull(choices);
        Assert.Equal(5, choices.Count);
        Assert.All(choices, c => Assert.InRange(c.Id, 1, 5));
        Assert.All(choices, c => Assert.False(string.IsNullOrEmpty(c.Name)));
    }

    [Fact]
    public async Task GetChoice_ReturnsValidChoice()
    {
        _factory.RandomApiMock
            .Setup(s => s.GetComputerChoiceAsync())
            .ReturnsAsync(Choice.FromChoiceType(ChoiceType.Rock));

        var response = await _client.GetAsync("/choice");

        response.EnsureSuccessStatusCode();
        var choice = await response.Content.ReadFromJsonAsync<ChoiceResponse>();

        Assert.NotNull(choice);
        Assert.Equal(1, choice.Id);
        Assert.Equal("Rock", choice.Name);
    }

    [Fact]
    public async Task PostPlay_ReturnsCorrectStructure()
    {
        // Rock (1) vs Scissors (3) → Win
        _factory.RandomApiMock
            .Setup(s => s.GetComputerChoiceAsync())
            .ReturnsAsync(Choice.FromChoiceType(ChoiceType.Scissors));

        var response = await _client.PostAsJsonAsync("/play", new { username = "Alice", player = 1 });

        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<PlayResultResponse>();

        Assert.NotNull(result);
        Assert.Equal("Alice", result.Username);
        Assert.Equal("Win", result.Results);
        Assert.Equal(1, result.Player.Id);
        Assert.Equal(3, result.Computer.Id);
    }

    [Fact]
    public async Task PostPlay_PersistsEntryToDatabase()
    {
        // Paper (2) vs Rock (1) → Win
        _factory.RandomApiMock
            .Setup(s => s.GetComputerChoiceAsync())
            .ReturnsAsync(Choice.FromChoiceType(ChoiceType.Rock));

        await _client.PostAsJsonAsync("/play", new { username = "Bob", player = 2 });

        var response = await _client.GetAsync("/scoreboard");

        response.EnsureSuccessStatusCode();
        var entries = await response.Content.ReadFromJsonAsync<List<ScoreboardEntryResponse>>();

        Assert.NotNull(entries);
        var entry = Assert.Single(entries);
        Assert.Equal("Bob", entry.Username);
        Assert.Equal(2, entry.PlayerChoiceId);
        Assert.Equal(1, entry.ComputerChoiceId);
        Assert.Equal("Win", entry.Result);
    }

    [Fact]
    public async Task GetScoreboard_ReturnsSavedResultsOrderedByDateDescending()
    {
        var now = DateTime.UtcNow;

        await _factory.SeedAsync(db => db.ScoreboardEntries.AddRange(
            new ScoreboardEntry { Username = "Player1", PlayerChoiceId = 1, ComputerChoiceId = 2, Result = "Lose", PlayedAtUtc = now.AddMinutes(-10) },
            new ScoreboardEntry { Username = "Player2", PlayerChoiceId = 2, ComputerChoiceId = 1, Result = "Win",  PlayedAtUtc = now.AddMinutes(-5) }
        ));

        var response = await _client.GetAsync("/scoreboard");

        response.EnsureSuccessStatusCode();
        var entries = await response.Content.ReadFromJsonAsync<List<ScoreboardEntryResponse>>();

        Assert.NotNull(entries);
        Assert.Equal(2, entries.Count);
        Assert.Equal("Player2", entries[0].Username);
        Assert.Equal("Player1", entries[1].Username);
    }

    [Fact]
    public async Task GetChoice_WhenServiceUnavailable_Returns503()
    {
        _factory.RandomApiMock
            .Setup(s => s.GetComputerChoiceAsync())
            .ThrowsAsync(new HttpRequestException("Connection refused"));

        var response = await _client.GetAsync("/choice");

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
    }

    [Fact]
    public async Task GetChoice_WhenInvalidResponse_Returns502()
    {
        _factory.RandomApiMock
            .Setup(s => s.GetComputerChoiceAsync())
            .ThrowsAsync(new InvalidOperationException("Unexpected response"));

        var response = await _client.GetAsync("/choice");

        Assert.Equal(HttpStatusCode.BadGateway, response.StatusCode);
    }

    [Fact]
    public async Task PostPlay_WhenServiceUnavailable_Returns503()
    {
        _factory.RandomApiMock
            .Setup(s => s.GetComputerChoiceAsync())
            .ThrowsAsync(new HttpRequestException("Connection refused"));

        var response = await _client.PostAsJsonAsync("/play", new { username = "Alice", player = 1 });

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
    }

    [Fact]
    public async Task DeleteScoreboard_RemovesAllEntries()
    {
        var now = DateTime.UtcNow;

        await _factory.SeedAsync(db => db.ScoreboardEntries.AddRange(
            new ScoreboardEntry { Username = "P1", PlayerChoiceId = 1, ComputerChoiceId = 2, Result = "Lose", PlayedAtUtc = now },
            new ScoreboardEntry { Username = "P2", PlayerChoiceId = 3, ComputerChoiceId = 1, Result = "Win",  PlayedAtUtc = now }
        ));

        var deleteResponse = await _client.DeleteAsync("/scoreboard");
        var getResponse = await _client.GetAsync("/scoreboard");

        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);
        var entries = await getResponse.Content.ReadFromJsonAsync<List<ScoreboardEntryResponse>>();
        Assert.NotNull(entries);
        Assert.Empty(entries);
    }
}
