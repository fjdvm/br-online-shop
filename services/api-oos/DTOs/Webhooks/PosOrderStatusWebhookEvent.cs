namespace ApiOos.DTOs.Webhooks;

/// <summary>Envelope POS posts after payment or fulfillment state changes.</summary>
public sealed class PosOrderStatusWebhookEvent
{
    public required string EventId { get; init; }
    public required string EventType { get; init; }
    public required PosOrderStatusWebhookData Data { get; init; }
}

public sealed class PosOrderStatusWebhookData
{
    /// <summary>The api-oos order number.</summary>
    public required string OrderId { get; init; }
    public string? PaymentStatus { get; init; }
    public string? DeliveryStatus { get; init; }
    public string? OccurredAt { get; init; }
}
