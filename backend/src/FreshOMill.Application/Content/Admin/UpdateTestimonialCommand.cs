using FreshOMill.Application.Common.Exceptions;
using FreshOMill.Application.Common.Interfaces;
using FreshOMill.Application.Common.Text;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Content.Admin;

public sealed record UpdateTestimonialCommand(
    Guid Id,
    string Name,
    string Text,
    string? VideoUrl,
    int DisplayOrder) : IRequest<AdminTestimonialDto>;

public sealed class UpdateTestimonialCommandHandler(IApplicationDbContext context)
    : IRequestHandler<UpdateTestimonialCommand, AdminTestimonialDto>
{
    public async Task<AdminTestimonialDto> Handle(UpdateTestimonialCommand request, CancellationToken cancellationToken)
    {
        var testimonial = await context.Testimonials.FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Customer story not found.");

        testimonial.Initial = AvatarGenerator.InitialFromName(request.Name);
        testimonial.AvatarGradient = AvatarGenerator.GradientFromName(request.Name);
        testimonial.Name = request.Name;
        testimonial.Text = request.Text;
        testimonial.VideoUrl = request.VideoUrl;
        testimonial.DisplayOrder = request.DisplayOrder;

        await context.SaveChangesAsync(cancellationToken);

        return new AdminTestimonialDto(
            testimonial.Id, testimonial.Initial, testimonial.AvatarGradient,
            testimonial.Name, testimonial.Text, testimonial.VideoUrl, testimonial.DisplayOrder);
    }
}
