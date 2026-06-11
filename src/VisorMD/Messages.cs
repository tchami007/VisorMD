using System.Text.Json.Serialization;

namespace VisorMD;

[JsonSourceGenerationOptions(PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase)]
[JsonSerializable(typeof(FileLoadedMessage))]
[JsonSerializable(typeof(FileChangedMessage))]
[JsonSerializable(typeof(FileInfoMessage))]
internal partial class AppJsonContext : JsonSerializerContext { }

internal class FileLoadedMessage
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = "file-loaded";
    [JsonPropertyName("content")]
    public string? Content { get; set; }
    [JsonPropertyName("fileName")]
    public string? FileName { get; set; }
    [JsonPropertyName("filePath")]
    public string? FilePath { get; set; }
    [JsonPropertyName("fileSize")]
    public long FileSize { get; set; }
}

internal class FileChangedMessage
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = "file-changed";
    [JsonPropertyName("content")]
    public string? Content { get; set; }
}

internal class FileInfoMessage
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = "file-info";
    [JsonPropertyName("fileName")]
    public string? FileName { get; set; }
    [JsonPropertyName("filePath")]
    public string? FilePath { get; set; }
    [JsonPropertyName("fileSize")]
    public long FileSize { get; set; }
}
