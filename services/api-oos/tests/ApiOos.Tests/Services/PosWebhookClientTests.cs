namespace ApiOos.Tests.Services;

using System.Net;
using System.Security.Cryptography;
using System.Text;
using ApiOos.DTOs.Webhooks;
using ApiOos.Services;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

public sealed class PosWebhookClientTests
{
    [Fact]
    public async Task SendAsync_signs_raw_json_and_swallows_receiver_failure()
    {
        var handler = new CapturingHandler(HttpStatusCode.ServiceUnavailable);
        var http = new HttpClient(handler) { BaseAddress = new Uri("http://pos.test/") };
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(
            new Dictionary<string, string?> { ["Pos:WebhookSecret"] = "pos-secret" }).Build();
        var client = new PosWebhookClient(new Factory(http), configuration, NullLogger<PosWebhookClient>.Instance);

        var act = () => client.SendAsync(new PosWebhookEvent
        {
            EventId = "evt-1", EventType = "order.created",
            Data = new PosWebhookData
            {
                OrderId = "ORD-1", PaymentMethod = "CashOnDelivery", TotalAmount = 200,
                ShippingRecipientName = "A", ShippingStreet = "S", ShippingCity = "C", ShippingProvince = "P",
                ShippingPostalCode = "1", ShippingPhone = "2", LineItems = [], OccurredAt = "2026-01-01T00:00:00.0000000Z",
            },
        });

        await act.Should().NotThrowAsync();
        handler.Path.Should().Be("/api/webhooks/pos-orders");
        var expected = "sha256=" + Convert.ToHexStringLower(HMACSHA256.HashData(
            Encoding.UTF8.GetBytes("pos-secret"), Encoding.UTF8.GetBytes(handler.Body!)));
        handler.Signature.Should().Be(expected);
    }

    private sealed class CapturingHandler(HttpStatusCode responseStatus) : HttpMessageHandler
    {
        public string? Body { get; private set; }
        public string? Signature { get; private set; }
        public string? Path { get; private set; }
        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            Body = await request.Content!.ReadAsStringAsync(cancellationToken);
            Signature = request.Headers.GetValues("X-Webhook-Signature").Single();
            Path = request.RequestUri!.AbsolutePath;
            return new HttpResponseMessage(responseStatus);
        }
    }

    private sealed class Factory(HttpClient client) : IHttpClientFactory
    {
        public HttpClient CreateClient(string name) => client;
    }
}
