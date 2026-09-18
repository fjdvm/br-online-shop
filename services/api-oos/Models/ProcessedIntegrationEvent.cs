namespace ApiOos.Models;

/// <summary>
/// Records inbound integration envelopes that have already been applied.  The
/// external event id is the idempotency key for at-least-once webhook delivery.
/// </summary>
public class ProcessedIntegrationEvent
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string EventId { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;
}
