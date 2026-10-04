using FreshOMill.Application.Common.Interfaces;
using FreshOMill.Application.Common.Text;
using FreshOMill.Domain.Content;
using MediatR;

namespace FreshOMill.Application.Content.Admin;

public sealed record CreateTestimonialCommand(
    string Name,
    string Text,
    string? VideoUrl,
    int DisplayOrder) : IRequest<AdminTestimonialDto>;

public sealed class CreateTestimonialCommandHandler(IApplicationDbContext context)
    : IRequestHandler<CreateTestimonialCommand, AdminTestimonialDto>
{
    public async Task<AdminTestimonialDto> Handle(CreateTestimonialCommand request, CancellationToken cancellationToken)
    {
        var testimonial = new Testimonial
        {
            Initial = AvatarGenerator.InitialFromName(request.Name),
            AvatarGradient = AvatarGenerator.GradientFromName(request.Name),
            Name = request.Name,
            Text = request.Text,
            VideoUrl = request.VideoUrl,
            DisplayOrder = request.DisplayOrder,
        };
        context.Testimonials.Add(testimonial);
        await context.SaveChangesAsync(cancellationToken);

        return new AdminTestimonialDto(
            testimonial.Id, testimonial.Initial, testimonial.AvatarGradient,
            testimonial.Name, testimonial.Text, testimonial.VideoUrl, testimonial.DisplayOrder);
    }
}
