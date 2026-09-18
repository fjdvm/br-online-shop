namespace ApiOos.Interfaces.Services;

using ApiOos.DTOs.Webhooks;

/// <summary>Sends signed order-created events to POS without affecting checkout.</summary>
public interface IPosWebhookClient
{
    Task SendAsync(PosWebhookEvent webhookEvent, CancellationToken cancellationToken = default);
}
