namespace BasarSoftProje;

public class Response<T>
{
    public bool Success { get; init; }
    public string Message { get; init; } = "";
    public T? Data { get; init; }

    public static Response<T> Ok(T data, string message = "Success")
        => new() { Success = true, Message = message, Data = data };

    public static Response<T> Fail(string message)
        => new() { Success = false, Message = message, Data = default };
    public static Response<T> Fail(string message, T? data)
        => new() { Success = false, Message = message, Data = data };
}
