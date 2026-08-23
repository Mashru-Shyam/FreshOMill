using FreshOMill.Application.Common.Exceptions;
using FreshOMill.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Content.Admin;

public sealed record UpdateHeroSlideCommand(
    Guid Id,
    string? ImageUrl,
    string Alt,
    string Icon,
    string Title,
    string Subtitle,
    string FallbackGradient,
    int DisplayOrder) : IRequest<AdminHeroSlideDto>;

public sealed class UpdateHeroSlideCommandHandler(IApplicationDbContext context)
    : IRequestHandler<UpdateHeroSlideCommand, AdminHeroSlideDto>
{
    public async Task<AdminHeroSlideDto> Handle(UpdateHeroSlideCommand request, CancellationToken cancellationToken)
    {
        var slide = await context.HeroSlides.FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Hero slide not found.");

        slide.ImageUrl = request.ImageUrl;
        slide.Alt = request.Alt;
        slide.Icon = request.Icon;
        slide.Title = request.Title;
        slide.Subtitle = request.Subtitle;
        slide.FallbackGradient = request.FallbackGradient;
        slide.DisplayOrder = request.DisplayOrder;

        await context.SaveChangesAsync(cancellationToken);

        return new AdminHeroSlideDto(slide.Id, slide.ImageUrl, slide.Alt, slide.Icon, slide.Title, slide.Subtitle, slide.FallbackGradient, slide.DisplayOrder);
    }
}
