namespace FreshOMill.Api.Endpoints.Content;

/// <summary>
/// Saves an uploaded video straight into wwwroot/videos/uploads and returns its public URL —
/// same static-file serving every image upload already uses. See AdminImageEndpoints for the
/// production-deployment caveat about ephemeral filesystems; it applies here identically.
/// </summary>
public static class AdminVideoEndpoints
{
    private const long MaxFileSizeBytes = 50 * 1024 * 1024;
    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "video/mp4", "video/webm", "video/quicktime",
    };
    private static readonly Dictionary<string, string> ExtensionByContentType = new(StringComparer.OrdinalIgnoreCase)
    {
        ["video/mp4"] = ".mp4",
        ["video/webm"] = ".webm",
        ["video/quicktime"] = ".mov",
    };

    public static IEndpointRouteBuilder MapAdminVideoEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/admin/videos").WithTags("Admin").RequireAuthorization("Admin");

        group.MapPost("/", async (IFormFile? file, IWebHostEnvironment env, CancellationToken cancellationToken) =>
        {
            if (file is null || file.Length == 0)
            {
                return Results.BadRequest(new { error = "No file was uploaded." });
            }

            if (file.Length > MaxFileSizeBytes)
            {
                return Results.BadRequest(new { error = "Videos must be 50MB or smaller." });
            }

            if (!AllowedContentTypes.Contains(file.ContentType))
            {
                return Results.BadRequest(new { error = "Only MP4, WebM, or MOV videos are allowed." });
            }

            var uploadsDir = Path.Combine(env.WebRootPath, "videos", "uploads");
            Directory.CreateDirectory(uploadsDir);

            var fileName = $"{Guid.NewGuid()}{ExtensionByContentType[file.ContentType]}";
            var filePath = Path.Combine(uploadsDir, fileName);

            await using (var stream = File.Create(filePath))
            {
                await file.CopyToAsync(stream, cancellationToken);
            }

            return Results.Ok(new { url = $"/videos/uploads/{fileName}" });
        })
        .WithName("UploadAdminVideo")
        .DisableAntiforgery()
        .Produces(200)
        .Produces(400);

        return app;
    }
}
