using FreshOMill.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Content;

public sealed record GetTestimonialsQuery : IRequest<IReadOnlyList<TestimonialDto>>;

public sealed class GetTestimonialsQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetTestimonialsQuery, IReadOnlyList<TestimonialDto>>
{
    public async Task<IReadOnlyList<TestimonialDto>> Handle(GetTestimonialsQuery request, CancellationToken cancellationToken) =>
        await context.Testimonials
            .OrderBy(t => t.DisplayOrder)
            .Select(t => new TestimonialDto(t.Initial, t.AvatarGradient, t.Name, t.Text, t.DisplayOrder))
            .ToListAsync(cancellationToken);
}
