using System.Net;
using System.Text.Json;
using BillupsCodingChallenge.Application.Services;
using Microsoft.Extensions.Logging;
using Xunit;

namespace BillupsCodingChallenge.UnitTests;

public class RandomApiServiceTests
{
    private static (RandomApiService Service, CapturingLogger Logger) CreateService(
        Func<HttpRequestMessage, HttpResponseMessage> handler)
    {
        var httpClient = new HttpClient(new MockHttpMessageHandler(handler))
        {
            BaseAddress = new Uri("https://example.com/")
        };
        var logger = new CapturingLogger();
        return (new RandomApiService(httpClient, logger), logger);
    }

    private static HttpResponseMessage JsonResponse(object body) =>
        new(HttpStatusCode.OK)
        {
            Content = new StringContent(
                JsonSerializer.Serialize(body),
                System.Text.Encoding.UTF8,
                "application/json")
        };

    // Mapping: (randomNumber - 1) / 20 + 1
    [Theory]
    [InlineData(1,   1)]  // Rock  — lower boundary
    [InlineData(20,  1)]  // Rock  — upper boundary
    [InlineData(21,  2)]  // Paper — lower boundary
    [InlineData(40,  2)]  // Paper — upper boundary
    [InlineData(41,  3)]  // Scissors — lower boundary
    [InlineData(60,  3)]  // Scissors — upper boundary
    [InlineData(61,  4)]  // Lizard — lower boundary
    [InlineData(80,  4)]  // Lizard — upper boundary
    [InlineData(81,  5)]  // Spock — lower boundary
    [InlineData(100, 5)]  // Spock — upper boundary
    public async Task GetComputerChoiceAsync_WhenApiReturnsRandomNumber_MapsToCorrectChoice(
        int randomNumber, int expectedChoiceId)
    {
        var (service, _) = CreateService(_ => JsonResponse(new { random_number = randomNumber }));

        var choice = await service.GetComputerChoiceAsync();

        Assert.Equal(expectedChoiceId, choice.Id);
    }

    [Fact]
    public async Task GetComputerChoiceAsync_WhenHttpRequestExceptionThrown_ReturnsFallbackChoice()
    {
        var (service, _) = CreateService(_ => throw new HttpRequestException("Connection refused"));

        var choice = await service.GetComputerChoiceAsync();

        Assert.InRange(choice.Id, 1, 5);
    }

    [Fact]
    public async Task GetComputerChoiceAsync_WhenApiReturnsNull_ReturnsFallbackChoice()
    {
        var (service, _) = CreateService(_ => new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent("null", System.Text.Encoding.UTF8, "application/json")
        });

        var choice = await service.GetComputerChoiceAsync();

        Assert.InRange(choice.Id, 1, 5);
    }

    [Fact]
    public async Task GetComputerChoiceAsync_WhenFallbackUsed_LogsWarning()
    {
        var (service, logger) = CreateService(_ => throw new HttpRequestException("Connection refused"));

        await service.GetComputerChoiceAsync();

        Assert.Contains(logger.Logs, l => l.Level == LogLevel.Warning);
    }

    private class MockHttpMessageHandler(Func<HttpRequestMessage, HttpResponseMessage> handler)
        : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request, CancellationToken cancellationToken)
        {
            try
            {
                return Task.FromResult(handler(request));
            }
            catch (Exception ex)
            {
                return Task.FromException<HttpResponseMessage>(ex);
            }
        }
    }

    private class CapturingLogger : ILogger<RandomApiService>
    {
        public List<(LogLevel Level, string Message)> Logs { get; } = [];

        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;
        public bool IsEnabled(LogLevel logLevel) => true;

        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state,
            Exception? exception, Func<TState, Exception?, string> formatter)
            => Logs.Add((logLevel, formatter(state, exception)));
    }
}
