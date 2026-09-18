namespace ApiOos.Services;

using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using ApiOos.DTOs.Webhooks;
using ApiOos.Interfaces.Services;

/// <summary>
/// Delivers signed POS order events. POS outages are intentionally best-effort so
/// a downstream receiver cannot make a committed shopper checkout fail.
/// </summary>
public sealed class PosWebhookClient(
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    ILogger<PosWebhookClient> logger) : IPosWebhookClient
{
    public const string HttpClientName = "ApiPos";
    // POS implements this published api-oos contract when the service is created.
    private const string WebhookPath = "api/webhooks/pos-orders";

    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNamingPolicy = null };

    public async Task SendAsync(PosWebhookEvent webhookEvent, CancellationToken cancellationToken = default)
    {
        try
        {
            var body = JsonSerializer.Serialize(webhookEvent, JsonOptions);
            var secret = configuration["Pos:WebhookSecret"] ?? string.Empty;
            var client = httpClientFactory.CreateClient(HttpClientName);
            using var request = new HttpRequestMessage(HttpMethod.Post, WebhookPath)
            {
                Content = new StringContent(body, Encoding.UTF8, "application/json"),
            };
            request.Headers.TryAddWithoutValidation("X-Webhook-Signature", ComputeSignature(body, secret));

            using var response = await client.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("POS rejected {EventType} webhook {EventId}: {Status}",
                    webhookEvent.EventType, webhookEvent.EventId, (int)response.StatusCode);
            }
        }
        catch (Exception exception)
        {
            logger.LogWarning(exception, "Failed to deliver {EventType} webhook {EventId} to POS.",
                webhookEvent.EventType, webhookEvent.EventId);
        }
    }

    private static string ComputeSignature(string body, string secret)
        => "sha256=" + Convert.ToHexStringLower(HMACSHA256.HashData(
            Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes(body)));
}
