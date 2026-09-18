namespace ApiOos.Tests.Controllers;

using System.Security.Cryptography;
using System.Text;
using ApiOos.Controllers;
using ApiOos.DTOs.Webhooks;
using ApiOos.Interfaces.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

public sealed class PosWebhookControllerTests
{
    [Fact]
    public async Task Receive_accepts_valid_signature_and_dispatches_event()
    {
        const string body = "{\"EventId\":\"evt-1\",\"EventType\":\"pos.order.status_updated\",\"Data\":{\"OrderId\":\"ORD-1\",\"PaymentStatus\":\"Paid\"}}";
        var ingestion = new FakeIngestionService();
        var controller = BuildController(body, Signature(body, "secret"), ingestion);

        var result = await controller.Receive(CancellationToken.None);

        result.Should().BeOfType<OkResult>();
        ingestion.Events.Should().ContainSingle().Which.EventId.Should().Be("evt-1");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("sha256=0000")]
    public async Task Receive_rejects_missing_or_invalid_signature(string? signature)
    {
        var controller = BuildController("{}", signature, new FakeIngestionService());

        var result = await controller.Receive(CancellationToken.None);

        result.Should().BeOfType<UnauthorizedResult>();
    }

    private static PosWebhookController BuildController(string body, string? signature, FakeIngestionService ingestion)
    {
        var context = new DefaultHttpContext();
        context.Request.Body = new MemoryStream(Encoding.UTF8.GetBytes(body));
        if (signature is not null) context.Request.Headers["X-Webhook-Signature"] = signature;
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(
            new Dictionary<string, string?> { ["Pos:WebhookSecret"] = "secret" }).Build();
        return new PosWebhookController(configuration, ingestion, NullLogger<PosWebhookController>.Instance)
        {
            ControllerContext = new ControllerContext { HttpContext = context },
        };
    }

    private static string Signature(string body, string secret) => "sha256=" + Convert.ToHexStringLower(
        HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes(body)));

    private sealed class FakeIngestionService : IPosOrderIngestionService
    {
        public List<PosOrderStatusWebhookEvent> Events { get; } = [];
        public Task IngestAsync(PosOrderStatusWebhookEvent webhookEvent, CancellationToken cancellationToken = default)
        {
            Events.Add(webhookEvent);
            return Task.CompletedTask;
        }
    }
}
