namespace FreshOMill.Application.Cart;

public sealed record CartLineDto(
    Guid Id,
    string? ProductSlug,
    string Name,
    string? ImageUrl,
    string Variant,
    decimal UnitPrice,
    int Qty);

public sealed record CartDto(IReadOnlyList<CartLineDto> Lines, decimal Subtotal);
