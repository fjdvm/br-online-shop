namespace ApiOos.Tests.Services;

using ApiOos.Data;
using ApiOos.DTOs.Webhooks;
using ApiOos.Enums;
using ApiOos.Interfaces.Services;
using ApiOos.Models;
using ApiOos.Repositories;
using ApiOos.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

public sealed class PosOrderIngestionServiceTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly FakeEcommerceWebhookClient _crm = new();
    private readonly PosOrderIngestionService _service;

    public PosOrderIngestionServiceTests()
    {
        _context = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite("DataSource=:memory:").Options);
        _context.Database.OpenConnection();
        _context.Database.EnsureCreated();
        _service = new PosOrderIngestionService(_context, new OrderRepository(_context), _crm,
            NullLogger<PosOrderIngestionService>.Instance);
    }

    [Fact]
    public async Task IngestAsync_applies_both_statuses_relays_update_and_deduplicates()
    {
        var order = await CreateOrderAsync("ORD-POS-1");
        var webhookEvent = Event("evt-pos-1", order.OrderNumber, "Paid", "Delivered");

        await _service.IngestAsync(webhookEvent);
        await _service.IngestAsync(webhookEvent);

        order.Status.Should().Be(OrderStatus.Delivered);
        order.Payment!.Status.Should().Be(PaymentStatus.Paid);
        (await _context.ProcessedIntegrationEvents.CountAsync()).Should().Be(1);
        _crm.Sent.Should().ContainSingle(e => e.EventType == "order.updated" &&
            e.Data.OrderId == order.OrderNumber && e.Data.Status == "delivered");
    }

    [Fact]
    public async Task IngestAsync_unknown_order_is_acknowledgeable_and_does_not_relay()
    {
        await _service.IngestAsync(Event("evt-missing", "ORD-MISSING", "Paid", null));

        (await _context.ProcessedIntegrationEvents.SingleAsync()).EventId.Should().Be("evt-missing");
        _crm.Sent.Should().BeEmpty();
    }

    private async Task<Order> CreateOrderAsync(string number)
    {
        var user = new User { Email = "pos@example.com", FullName = "POS Shopper", PasswordHash = "hash" };
        var order = new Order { OrderNumber = number, User = user, UserId = user.Id, Status = OrderStatus.Processing };
        order.Payment = new Payment { Order = order, OrderId = order.Id, Status = PaymentStatus.Pending };
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();
        return order;
    }

    private static PosOrderStatusWebhookEvent Event(string id, string orderId, string? payment, string? delivery) => new()
    {
        EventId = id, EventType = "pos.order.status_updated",
        Data = new PosOrderStatusWebhookData { OrderId = orderId, PaymentStatus = payment, DeliveryStatus = delivery },
    };

    public void Dispose()
    {
        _context.Database.CloseConnection();
        _context.Dispose();
    }

    private sealed class FakeEcommerceWebhookClient : IEcommerceWebhookClient
    {
        public List<EcommerceWebhookEvent> Sent { get; } = [];
        public Task SendAsync(EcommerceWebhookEvent webhookEvent, CancellationToken cancellationToken = default)
        {
            Sent.Add(webhookEvent);
            return Task.CompletedTask;
        }
    }
}
