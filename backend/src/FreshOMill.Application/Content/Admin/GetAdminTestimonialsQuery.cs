using FreshOMill.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Content.Admin;

public sealed record GetAdminTestimonialsQuery : IRequest<IReadOnlyList<AdminTestimonialDto>>;

public sealed class GetAdminTestimonialsQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetAdminTestimonialsQuery, IReadOnlyList<AdminTestimonialDto>>
{
    public async Task<IReadOnlyList<AdminTestimonialDto>> Handle(GetAdminTestimonialsQuery request, CancellationToken cancellationToken) =>
        await context.Testimonials
            .OrderBy(t => t.DisplayOrder)
            .Select(t => new AdminTestimonialDto(t.Id, t.Initial, t.AvatarGradient, t.Name, t.Text, t.VideoUrl, t.DisplayOrder))
            .ToListAsync(cancellationToken);
}
