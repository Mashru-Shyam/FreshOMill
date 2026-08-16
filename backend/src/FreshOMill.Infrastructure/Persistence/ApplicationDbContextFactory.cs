using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace FreshOMill.Infrastructure.Persistence;

/// <summary>
/// Lets `dotnet ef` create migrations without spinning up the full Api host. Reads the same
/// ConnectionStrings:Postgres value the real app would — from FreshOMill.Api's user-secrets (read by
/// ID directly, since Infrastructure can't reference Api without a circular dependency) or the
/// ConnectionStrings__Postgres env var — falling back to the docker-compose default only if neither is set.
/// </summary>
public sealed class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    // Must match FreshOMill.Api.csproj's <UserSecretsId> — update both if that ever changes.
    private const string ApiUserSecretsId = "20a290b3-be1f-4bf5-af14-ce4e9c992c5c";

    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var configuration = new ConfigurationBuilder()
            .AddUserSecrets(ApiUserSecretsId)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = configuration.GetConnectionString("Postgres")
            ?? "Host=localhost;Port=5432;Database=freshomill;Username=freshomill;Password=freshomill_dev_password";

        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseNpgsql(connectionString);

        return new ApplicationDbContext(optionsBuilder.Options);
    }
}
