using FreshOMill.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Content.Admin;

public sealed record GetAdminHeroSlidesQuery : IRequest<IReadOnlyList<AdminHeroSlideDto>>;

public sealed class GetAdminHeroSlidesQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetAdminHeroSlidesQuery, IReadOnlyList<AdminHeroSlideDto>>
{
    public async Task<IReadOnlyList<AdminHeroSlideDto>> Handle(GetAdminHeroSlidesQuery request, CancellationToken cancellationToken) =>
        await context.HeroSlides
            .OrderBy(s => s.DisplayOrder)
            .Select(s => new AdminHeroSlideDto(s.Id, s.ImageUrl, s.Alt, s.Icon, s.Title, s.Subtitle, s.FallbackGradient, s.DisplayOrder))
            .ToListAsync(cancellationToken);
}
