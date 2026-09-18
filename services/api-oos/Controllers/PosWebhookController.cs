namespace ApiOos.Controllers;

using System.Text.Json;
using ApiOos.DTOs.Webhooks;
using ApiOos.Helpers;
using ApiOos.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[AllowAnonymous] // Authenticated by X-Webhook-Signature, not a shopper JWT.
[ApiController]
[Route("api/webhooks/pos")]
public sealed class PosWebhookController(
    IConfiguration configuration,
    IPosOrderIngestionService ingestionService,
    ILogger<PosWebhookController> logger) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Receive(CancellationToken cancellationToken)
    {
        using var body = new MemoryStream();
        await Request.Body.CopyToAsync(body, cancellationToken);
        var payload = body.ToArray();
        var signature = Request.Headers["X-Webhook-Signature"].FirstOrDefault();
        var secret = configuration["Pos:WebhookSecret"] ?? string.Empty;
        if (!HmacSignatureValidator.IsValid(payload, signature, secret))
        {
            return Unauthorized();
        }

        PosOrderStatusWebhookEvent? webhookEvent;
        try
        {
            webhookEvent = JsonSerializer.Deserialize<PosOrderStatusWebhookEvent>(payload,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }
        catch (JsonException exception)
        {
            logger.LogWarning(exception, "POS sent a signed but malformed webhook payload.");
            return Ok();
        }

        if (webhookEvent is null || string.IsNullOrWhiteSpace(webhookEvent.EventId) ||
            string.IsNullOrWhiteSpace(webhookEvent.EventType) || webhookEvent.Data is null ||
            string.IsNullOrWhiteSpace(webhookEvent.Data.OrderId))
        {
            logger.LogWarning("POS sent a signed webhook with missing required fields.");
            return Ok();
        }

        try
        {
            await ingestionService.IngestAsync(webhookEvent, cancellationToken);
        }
        catch (Exception exception)
        {
            // The receiver always acknowledges a signed delivery. Idempotency makes
            // successful redelivery safe when POS retries after transport failures.
            logger.LogError(exception, "Failed to ingest POS webhook {EventId}.", webhookEvent.EventId);
        }
        return Ok();
    }
}
