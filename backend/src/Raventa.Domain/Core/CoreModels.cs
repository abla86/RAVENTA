namespace Raventa.Domain.Core;

public enum RecordStatus
{
    Open,
    InProgress,
    PendingVerification,
    Closed,
    Cancelled
}

public enum Severity
{
    Low,
    Medium,
    High,
    Critical
}

public enum RiskLevel
{
    Low,
    Medium,
    High,
    Critical
}

public enum ActionType
{
    Corrective,
    Preventive,
    Improvement,
    Containment
}

public class ControlRecord
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public RecordStatus Status { get; set; } = RecordStatus.Open;
    public Severity Severity { get; set; } = Severity.Medium;
    public string Domain { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string? ResponsiblePerson { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? ClosedAtUtc { get; set; }
}

public class Risk
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Likelihood { get; set; }
    public int Consequence { get; set; }
    public int RiskScore { get; set; }
    public RiskLevel Level { get; set; } = RiskLevel.Low;
}

public class ActionItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ActionType Type { get; set; }
    public RecordStatus Status { get; set; } = RecordStatus.Open;
}
