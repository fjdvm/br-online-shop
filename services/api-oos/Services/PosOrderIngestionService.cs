namespace ApiOos.Services;

using ApiOos.Data;
using ApiOos.DTOs.Webhooks;
using ApiOos.Enums;
using ApiOos.Interfaces.Repositories;
using ApiOos.Interfaces.Services;
using ApiOos.Models;
using Microsoft.EntityFrameworkCore;

/// <summary>
/// Applies POS-owned payment/fulfillment changes locally and relays the resulting
/// order state to CRM. The event id is stored in the same transaction as the cache
/// update so redelivery is harmless.
/// </summary>
public sealed class PosOrderIngestionService(
    AppDbContext context,
    IOrderRepository orderRepository,
    IEcommerceWebhookClient ecommerceWebhookClient,
    ILogger<PosOrderIngestionService> logger) : IPosOrderIngestionService
{
    public async Task IngestAsync(PosOrderStatusWebhookEvent webhookEvent, CancellationToken cancellationToken = default)
    {
        if (!string.Equals(webhookEvent.EventType, "pos.order.status_updated", StringComparison.OrdinalIgnoreCase))
        {
            logger.LogWarning("Ignoring unsupported POS event type {EventType} ({EventId}).",
                webhookEvent.EventType, webhookEvent.EventId);
            return;
        }

        if (await context.ProcessedIntegrationEvents.AnyAsync(e => e.EventId == webhookEvent.EventId, cancellationToken))
        {
            return;
        }

        var order = await orderRepository.GetByOrderNumberAsync(webhookEvent.Data.OrderId);
        if (order is null)
        {
            logger.LogWarning("Ignoring POS event {EventId}: order {OrderNumber} was not found.",
                webhookEvent.EventId, webhookEvent.Data.OrderId);
            await RecordProcessedAsync(webhookEvent, cancellationToken);
            return;
        }

        var changed = ApplyStatus(order, webhookEvent.Data);
        context.ProcessedIntegrationEvents.Add(new ProcessedIntegrationEvent
        {
            EventId = webhookEvent.EventId,
            EventType = webhookEvent.EventType,
            ProcessedAt = DateTime.UtcNow,
        });

        try
        {
            await context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception)
        {
            logger.LogWarning(exception, "Unable to record POS event {EventId}; it may be a concurrent redelivery.",
                webhookEvent.EventId);
            return;
        }

        if (changed)
        {
            await RelayOrderUpdatedAsync(order, cancellationToken);
        }
    }

    private async Task RecordProcessedAsync(PosOrderStatusWebhookEvent webhookEvent, CancellationToken cancellationToken)
    {
        context.ProcessedIntegrationEvents.Add(new ProcessedIntegrationEvent
        {
            EventId = webhookEvent.EventId,
            EventType = webhookEvent.EventType,
            ProcessedAt = DateTime.UtcNow,
        });
        try
        {
            await context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception)
        {
            logger.LogWarning(exception, "Unable to record unknown-order POS event {EventId}.", webhookEvent.EventId);
        }
    }

    private static bool ApplyStatus(Order order, PosOrderStatusWebhookData data)
    {
        var changed = false;
        if (TryMapOrderStatus(data.DeliveryStatus, out var orderStatus) && order.Status != orderStatus)
        {
            order.Status = orderStatus;
            changed = true;
        }

        if (order.Payment is not null && TryMapPaymentStatus(data.PaymentStatus, out var paymentStatus) &&
            order.Payment.Status != paymentStatus)
        {
            order.Payment.Status = paymentStatus;
            order.Payment.UpdatedAt = DateTime.UtcNow;
            changed = true;
        }

        if (changed)
        {
            order.UpdatedAt = DateTime.UtcNow;
        }
        return changed;
    }

    private async Task RelayOrderUpdatedAsync(Order order, CancellationToken cancellationToken)
    {
        try
        {
            await ecommerceWebhookClient.SendAsync(new EcommerceWebhookEvent
            {
                EventId = Guid.NewGuid().ToString(),
                EventType = "order.updated",
                Data = new EcommerceWebhookData
                {
                    OrderId = order.OrderNumber,
                    CustomerEmail = order.User?.Email,
                    Name = order.User?.FullName,
                    Status = MapOrderStatus(order.Status),
                    Total = order.TotalAmount,
                    RefundedAmount = order.Payment?.Status == PaymentStatus.Refunded ? order.TotalAmount : 0m,
                    OccurredAt = order.UpdatedAt.ToUniversalTime().ToString("O"),
                    LineItems = order.Items.Select(item => new EcommerceWebhookLineItem
                    {
                        ProductId = item.ProductId.ToString(), ProductName = item.ProductName,
                        Quantity = item.Quantity, UnitPrice = item.UnitPrice,
                    }).ToList(),
                },
            }, cancellationToken);
        }
        catch (Exception exception)
        {
            logger.LogWarning(exception, "Failed to relay POS status update for order {OrderNumber} to api-crms.", order.OrderNumber);
        }
    }

    private static bool TryMapOrderStatus(string? value, out OrderStatus status)
    {
        switch (value?.Trim().ToLowerInvariant())
        {
            case "pending": status = OrderStatus.Pending; return true;
            case "processing": status = OrderStatus.Processing; return true;
            case "shipped": status = OrderStatus.Shipped; return true;
            case "delivered": status = OrderStatus.Delivered; return true;
            case "cancelled":
            case "canceled": status = OrderStatus.Cancelled; return true;
            default: status = default; return false;
        }
    }

    private static bool TryMapPaymentStatus(string? value, out PaymentStatus status)
    {
        switch (value?.Trim().ToLowerInvariant())
        {
            case "pending": status = PaymentStatus.Pending; return true;
            case "paid": status = PaymentStatus.Paid; return true;
            case "failed": status = PaymentStatus.Failed; return true;
            case "refunded": status = PaymentStatus.Refunded; return true;
            default: status = default; return false;
        }
    }

    private static string MapOrderStatus(OrderStatus status) => status switch
    {
        OrderStatus.Shipped => "shipped",
        OrderStatus.Delivered => "delivered",
        _ => "pending",
    };
}
