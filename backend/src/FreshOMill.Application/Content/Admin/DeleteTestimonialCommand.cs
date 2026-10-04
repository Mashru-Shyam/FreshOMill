using FreshOMill.Application.Common.Exceptions;
using FreshOMill.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Content.Admin;

public sealed record DeleteTestimonialCommand(Guid Id) : IRequest;

public sealed class DeleteTestimonialCommandHandler(IApplicationDbContext context)
    : IRequestHandler<DeleteTestimonialCommand>
{
    public async Task Handle(DeleteTestimonialCommand request, CancellationToken cancellationToken)
    {
        var testimonial = await context.Testimonials.FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Customer story not found.");

        context.Testimonials.Remove(testimonial);
        await context.SaveChangesAsync(cancellationToken);
    }
}
