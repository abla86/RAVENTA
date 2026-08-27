using Microsoft.AspNetCore.Mvc;

namespace Raventa.Api.Controllers;

[ApiController]
[Route("api/control")]
public class ControlController : ControllerBase
{
    private static readonly List<ControlItem> Items = new()
    {
        new ControlItem(
            Guid.NewGuid(),
            "HMS",
            "Avvik",
            "Eksempelregistrering",
            "Medium",
            "Open"
        ),
        new ControlItem(
            Guid.NewGuid(),
            "Security",
            "Sikkerhetshendelse",
            "Eksempelregistrering",
            "High",
            "InProgress"
        )
    };

    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(Items);
    }

    [HttpGet("{id:guid}")]
    public IActionResult Get(Guid id)
    {
        var item = Items.FirstOrDefault(x => x.Id == id);

        if (item is null)
            return NotFound();

        return Ok(item);
    }

    [HttpPost]
    public IActionResult Create(CreateControlRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Area))
            return BadRequest(new { error = "Area er påkrevd." });

        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest(new { error = "Title er påkrevd." });

        var item = new ControlItem(
            Guid.NewGuid(),
            request.Area,
            request.Type,
            request.Title,
            request.Severity,
            "Open"
        );

        Items.Add(item);

        return Created($"/api/control/{item.Id}", item);
    }

    [HttpPatch("{id:guid}/status")]
    public IActionResult UpdateStatus(Guid id, UpdateStatusRequest request)
    {
        var index = Items.FindIndex(x => x.Id == id);

        if (index < 0)
            return NotFound();

        var current = Items[index];

        Items[index] = current with
        {
            Status = request.Status
        };

        return Ok(Items[index]);
    }

    [HttpGet("summary")]
    public IActionResult Summary()
    {
        return Ok(new
        {
            total = Items.Count,
            open = Items.Count(x => x.Status == "Open"),
            inProgress = Items.Count(x => x.Status == "InProgress"),
            pendingVerification = Items.Count(x => x.Status == "PendingVerification"),
            closed = Items.Count(x => x.Status == "Closed"),
            critical = Items.Count(x => x.Severity == "Critical")
        });
    }
}

public record ControlItem(
    Guid Id,
    string Area,
    string Type,
    string Title,
    string Severity,
    string Status
);

public record CreateControlRequest(
    string Area,
    string Type,
    string Title,
    string Severity
);

public record UpdateStatusRequest(string Status);
