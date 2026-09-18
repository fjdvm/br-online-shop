namespace ApiOos.DTOs.Webhooks;

/// <summary>Envelope sent to POS when a shopper places an order.</summary>
public sealed class PosWebhookEvent
{
    public required string EventId { get; init; }
    public required string EventType { get; init; }
    public required PosWebhookData Data { get; init; }
}

public sealed class PosWebhookData
{
    public required string OrderId { get; init; }
    public string? CustomerEmail { get; init; }
    public string? CustomerName { get; init; }
    public required string PaymentMethod { get; init; }
    public decimal TotalAmount { get; init; }
    public required string ShippingRecipientName { get; init; }
    public required string ShippingStreet { get; init; }
    public required string ShippingCity { get; init; }
    public required string ShippingProvince { get; init; }
    public required string ShippingPostalCode { get; init; }
    public required string ShippingPhone { get; init; }
    public required IReadOnlyList<PosWebhookLineItem> LineItems { get; init; }
    public required string OccurredAt { get; init; }
}

public sealed class PosWebhookLineItem
{
    public required string ProductId { get; init; }
    public required string ProductName { get; init; }
    public required string ProductSku { get; init; }
    public int Quantity { get; init; }
    public decimal UnitPrice { get; init; }
}
