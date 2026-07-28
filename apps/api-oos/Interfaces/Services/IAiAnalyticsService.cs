namespace ApiOos.Interfaces.Services;

using ApiOos.DTOs.Requests;
using ApiOos.DTOs.Responses;

public interface IAiAnalyticsService
{
    Task<BotReplyResponseDto> GetBotReplyAsync(BotReplyRequestDto dto, string? customerId = null);
    Task<BotReplyResponseDto> GetPublicBotReplyAsync(string userMessage);
}
