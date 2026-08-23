using FreshOMill.Domain.Common;

namespace FreshOMill.Domain.Catalog;

public sealed class Category : BaseAuditableEntity<Guid>
{
    // See Identity/User.cs for why this self-assigns Id. Previously unnecessary — every Category
    // row came from CategoryConfiguration's HasData seed until admin CRUD started creating rows
    // at runtime.
    public Category() => Id = Guid.NewGuid();

    public required string Slug { get; set; }

    public required string Name { get; set; }

    public string? ImageUrl { get; set; }

    /// <summary>Lower sorts first. Drives the "10 visible + rest under View All" split on the homepage grid.</summary>
    public int DisplayOrder { get; set; }
}
