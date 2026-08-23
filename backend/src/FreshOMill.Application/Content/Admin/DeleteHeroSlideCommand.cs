using FreshOMill.Application.Common.Exceptions;
using FreshOMill.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Content.Admin;

public sealed record DeleteHeroSlideCommand(Guid Id) : IRequest;

public sealed class DeleteHeroSlideCommandHandler(IApplicationDbContext context)
    : IRequestHandler<DeleteHeroSlideCommand>
{
    public async Task Handle(DeleteHeroSlideCommand request, CancellationToken cancellationToken)
    {
        var slide = await context.HeroSlides.FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Hero slide not found.");

        context.HeroSlides.Remove(slide);
        await context.SaveChangesAsync(cancellationToken);
    }
}
