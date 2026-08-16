using FreshOMill.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Content;

public sealed record GetHeroSlidesQuery : IRequest<IReadOnlyList<HeroSlideDto>>;

public sealed class GetHeroSlidesQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetHeroSlidesQuery, IReadOnlyList<HeroSlideDto>>
{
    public async Task<IReadOnlyList<HeroSlideDto>> Handle(GetHeroSlidesQuery request, CancellationToken cancellationToken) =>
        await context.HeroSlides
            .OrderBy(s => s.DisplayOrder)
            .Select(s => new HeroSlideDto(s.ImageUrl, s.Alt, s.Icon, s.Title, s.Subtitle, s.FallbackGradient, s.DisplayOrder))
            .ToListAsync(cancellationToken);
}
