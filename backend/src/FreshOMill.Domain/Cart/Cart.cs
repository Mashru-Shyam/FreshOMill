using FreshOMill.Domain.Common;

namespace FreshOMill.Domain.Cart;

public sealed class Cart : BaseAuditableEntity<Guid>
{
    // See Identity/User.cs for why this self-assigns Id.
    public Cart() => Id = Guid.NewGuid();

    public Guid UserId { get; set; }

    public List<CartLine> Lines { get; set; } = [];
}
