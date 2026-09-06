using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDb>(opt => opt.UseSqlite("Data Source=raventa.db"));
builder.Services.AddCors(opt => {
    opt.AddPolicy("AllowFrontend", p => p.WithOrigins("http://localhost:3000").AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

app.UseCors("AllowFrontend");

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDb>();
    db.Database.EnsureCreated();
    if (!db.Records.Any())
    {
        db.Records.AddRange(
            new ControlRecord { Domain = "hms", Title = "Manglende vernebriller i sone 2", Description = "Operatør observert uten påkrevd øyevern.", Severity = "Høy", Status = "Åpen" },
            new ControlRecord { Domain = "security", Title = "Uautorisert USB-enhet funnet", Description = "EDR-varsel på terminal 04.", Severity = "Kritisk", Status = "Under arbeid" }
        );
        db.SaveChanges();
    }
}

app.MapGet("/api/records", async (AppDb db, string? domain) =>
    string.IsNullOrEmpty(domain)
        ? await db.Records.OrderByDescending(r => r.CreatedAtUtc).ToListAsync()
        : await db.Records.Where(r => r.Domain == domain.ToLower()).OrderByDescending(r => r.CreatedAtUtc).ToListAsync());

app.MapPost("/api/records", async (AppDb db, ControlRecord rec) => {
    var domain = rec.Domain.Trim().ToLowerInvariant();
    var allowedSeverities = new[] { "Lav", "Medium", "Høy", "Kritisk", "Critical" };
    var allowedStatuses = new[] { "Åpen", "Under arbeid", "Verifisering", "Lukket" };

    if (domain is not ("hms" or "security") ||
        string.IsNullOrWhiteSpace(rec.Title) || rec.Title.Trim().Length > 200 ||
        rec.Description.Trim().Length > 5000 ||
        !allowedSeverities.Contains(rec.Severity) ||
        !allowedStatuses.Contains(rec.Status))
    {
        return Results.BadRequest(new { message = "Invalid control record. Check domain, title, description, severity and status." });
    }

    rec.Id = Guid.NewGuid();
    rec.CreatedAtUtc = DateTime.UtcNow;
    rec.Domain = domain;
    rec.Title = rec.Title.Trim();
    rec.Description = rec.Description.Trim();
    db.Records.Add(rec);
    await db.SaveChangesAsync();
    return Results.Created($"/api/records/{rec.Id}", rec);
});

app.MapPatch("/api/records/{id}/status", async (AppDb db, Guid id, StatusDto dto) => {
    var allowedStatuses = new[] { "Åpen", "Under arbeid", "Verifisering", "Lukket" };
    if (!allowedStatuses.Contains(dto.Status))
        return Results.BadRequest(new { message = "Invalid status." });

    var rec = await db.Records.FindAsync(id);
    if (rec == null) return Results.NotFound();
    rec.Status = dto.Status;
    await db.SaveChangesAsync();
    return Results.Ok(rec);
});

app.Run("http://localhost:5000");

public class ControlRecord
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Domain { get; set; } = "hms";
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Severity { get; set; } = "Medium";
    public string Status { get; set; } = "Åpen";
    public string? Responsible { get; set; } = "Ikke tildelt";
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

public record StatusDto(string Status);

public class AppDb : DbContext
{
    public AppDb(DbContextOptions<AppDb> opt) : base(opt) { }
    public DbSet<ControlRecord> Records => Set<ControlRecord>();
}
