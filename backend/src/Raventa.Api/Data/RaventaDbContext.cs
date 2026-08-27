using Microsoft.EntityFrameworkCore;

namespace Raventa.Api.Data;

public class RaventaDbContext : DbContext
{
    public RaventaDbContext(DbContextOptions<RaventaDbContext> options)
        : base(options)
    {
    }
}
