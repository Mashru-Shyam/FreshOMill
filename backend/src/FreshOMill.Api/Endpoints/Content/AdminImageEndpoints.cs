namespace FreshOMill.Api.Endpoints.Content;

/// <summary>
/// Saves an uploaded image straight into wwwroot/images/uploads and returns its public URL —
/// same static-file serving every other product/category image already uses.
///
/// IMPORTANT — flagged in the Admin Panel plan, not fixed here: if this API is deployed
/// somewhere with an ephemeral filesystem (Render's free/starter tiers wipe local disk on every
/// redeploy or restart), anything saved here will vanish the next time the service redeploys.
/// This is fine for local dev and for a host with a persistent disk; before relying on this in
/// production, either attach a persistent volume at wwwroot/images/uploads or swap this for an
/// external object store (S3 / Cloudinary / Azure Blob) — whichever it is, the endpoint's
/// contract (accepts a file, returns a URL) stays the same either way.
/// </summary>
public static class AdminImageEndpoints
{
    private const long MaxFileSizeBytes = 5 * 1024 * 1024;
    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/webp",
    };
    private static readonly Dictionary<string, string> ExtensionByContentType = new(StringComparer.OrdinalIgnoreCase)
    {
        ["image/jpeg"] = ".jpg",
        ["image/png"] = ".png",
        ["image/webp"] = ".webp",
    };

    public static IEndpointRouteBuilder MapAdminImageEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/admin/images").WithTags("Admin").RequireAuthorization("Admin");

        group.MapPost("/", async (IFormFile? file, IWebHostEnvironment env, CancellationToken cancellationToken) =>
        {
            if (file is null || file.Length == 0)
            {
                return Results.BadRequest(new { error = "No file was uploaded." });
            }

            if (file.Length > MaxFileSizeBytes)
            {
                return Results.BadRequest(new { error = "Images must be 5MB or smaller." });
            }

            if (!AllowedContentTypes.Contains(file.ContentType))
            {
                return Results.BadRequest(new { error = "Only JPEG, PNG, or WebP images are allowed." });
            }

            var uploadsDir = Path.Combine(env.WebRootPath, "images", "uploads");
            Directory.CreateDirectory(uploadsDir);

            var fileName = $"{Guid.NewGuid()}{ExtensionByContentType[file.ContentType]}";
            var filePath = Path.Combine(uploadsDir, fileName);

            await using (var stream = File.Create(filePath))
            {
                await file.CopyToAsync(stream, cancellationToken);
            }

            return Results.Ok(new { url = $"/images/uploads/{fileName}" });
        })
        .WithName("UploadAdminImage")
        .DisableAntiforgery()
        .Produces(200)
        .Produces(400);

        return app;
    }
}
