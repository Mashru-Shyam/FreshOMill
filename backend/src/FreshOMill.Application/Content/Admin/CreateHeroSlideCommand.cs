using FreshOMill.Application.Common.Interfaces;
using FreshOMill.Domain.Content;
using MediatR;

namespace FreshOMill.Application.Content.Admin;

public sealed record CreateHeroSlideCommand(
    string? ImageUrl,
    string Alt,
    string Icon,
    string Title,
    string Subtitle,
    string FallbackGradient,
    int DisplayOrder) : IRequest<AdminHeroSlideDto>;

public sealed class CreateHeroSlideCommandHandler(IApplicationDbContext context)
    : IRequestHandler<CreateHeroSlideCommand, AdminHeroSlideDto>
{
    public async Task<AdminHeroSlideDto> Handle(CreateHeroSlideCommand request, CancellationToken cancellationToken)
    {
        var slide = new HeroSlide
        {
            ImageUrl = request.ImageUrl,
            Alt = request.Alt,
            Icon = request.Icon,
            Title = request.Title,
            Subtitle = request.Subtitle,
            FallbackGradient = request.FallbackGradient,
            DisplayOrder = request.DisplayOrder,
        };
        context.HeroSlides.Add(slide);
        await context.SaveChangesAsync(cancellationToken);

        return new AdminHeroSlideDto(slide.Id, slide.ImageUrl, slide.Alt, slide.Icon, slide.Title, slide.Subtitle, slide.FallbackGradient, slide.DisplayOrder);
    }
}
