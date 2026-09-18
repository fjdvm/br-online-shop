namespace ApiOos.Interfaces.Services;

using ApiOos.DTOs.Webhooks;

public interface IPosOrderIngestionService
{
    /// <summary>Idempotently applies a verified POS status event.</summary>
    Task IngestAsync(PosOrderStatusWebhookEvent webhookEvent, CancellationToken cancellationToken = default);
}
