namespace FreshOMill.Application.Common.Models;

public class Result
{
    protected Result(bool succeeded, IReadOnlyList<string> errors)
    {
        Succeeded = succeeded;
        Errors = errors;
    }

    public bool Succeeded { get; }

    public IReadOnlyList<string> Errors { get; }

    public static Result Success() => new(true, []);

    public static Result Failure(IEnumerable<string> errors) => new(false, errors.ToList());

    public static Result Failure(string error) => new(false, [error]);
}

public sealed class Result<T> : Result
{
    private Result(bool succeeded, T? value, IReadOnlyList<string> errors)
        : base(succeeded, errors)
    {
        Value = value;
    }

    public T? Value { get; }

    public static Result<T> Success(T value) => new(true, value, []);

    public static new Result<T> Failure(IEnumerable<string> errors) => new(false, default, errors.ToList());

    public static new Result<T> Failure(string error) => new(false, default, [error]);
}
