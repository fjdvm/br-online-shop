namespace ApiOos.Services;

using System.Net.Http.Json;
using System.Text.Json;
using ApiOos.DTOs.Requests;
using ApiOos.DTOs.Responses;
using ApiOos.Interfaces.Services;
using Microsoft.Extensions.Logging;

public class AiAnalyticsService : IAiAnalyticsService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<AiAnalyticsService> _logger;

    public AiAnalyticsService(IHttpClientFactory httpClientFactory, ILogger<AiAnalyticsService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<BotReplyResponseDto> GetBotReplyAsync(BotReplyRequestDto dto, string? customerId = null)
    {
        return await ExecuteChatbotReplyAsync(dto.UserMessage, dto.TicketId, customerId);
    }

    public async Task<BotReplyResponseDto> GetPublicBotReplyAsync(string userMessage)
    {
        return await ExecuteChatbotReplyAsync(userMessage, null, null);
    }

    private async Task<BotReplyResponseDto> ExecuteChatbotReplyAsync(string message, string? ticketId, string? customerId)
    {
        try
        {
            var client = _httpClientFactory.CreateClient("AiAnalytics");
            var body = new
            {
                message = message,
                customer_id = customerId,
                ticket_id = string.IsNullOrWhiteSpace(ticketId) ? null : ticketId,
                conversation_history = Array.Empty<object>()
            };

            var response = await client.PostAsJsonAsync("/api/v1/chatbot/reply", body);
            if (response.IsSuccessStatusCode)
            {
                using var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
                var root = doc.RootElement;

                var reply = root.TryGetProperty("reply", out var replyProp) ? replyProp.GetString() ?? "" : "";
                var intent = root.TryGetProperty("intent", out var intentProp) ? intentProp.GetString() ?? "general_inquiry" : "general_inquiry";
                var shouldEscalate = root.TryGetProperty("should_escalate", out var escProp) && escProp.GetBoolean();

                return new BotReplyResponseDto
                {
                    Reply = reply,
                    Category = intent,
                    ShouldEscalate = shouldEscalate,
                };
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to call AI Analytics service for chatbot reply. Falling back to default assistant reply.");
        }

        // Fallback response
        return new BotReplyResponseDto
        {
            Reply = "Thank you for reaching out! How can I assist you further?",
            Category = "general_inquiry",
            ShouldEscalate = false,
        };
    }
}
