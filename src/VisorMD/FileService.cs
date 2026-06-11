namespace VisorMD;

public class FileInfoResult
{
    public string Name { get; set; } = "";
    public string FullPath { get; set; } = "";
    public long Size { get; set; }
    public DateTime LastModified { get; set; }
}

public class FileService
{
    public FileInfoResult? CurrentFileInfo { get; private set; }

    public string ReadFile(string path)
    {
        var fullPath = Path.GetFullPath(path);
        var bytes = File.ReadAllBytes(fullPath);

        if (bytes.Length >= 3 && bytes[0] == 0xEF && bytes[1] == 0xBB && bytes[2] == 0xBF)
            return File.ReadAllText(fullPath, System.Text.Encoding.UTF8);

        if (bytes.Length >= 2 && bytes[0] == 0xFF && bytes[1] == 0xFE)
            return File.ReadAllText(fullPath, System.Text.Encoding.Unicode);

        if (bytes.Length >= 2 && bytes[0] == 0xFE && bytes[1] == 0xFF)
            return File.ReadAllText(fullPath, System.Text.Encoding.BigEndianUnicode);

        return File.ReadAllText(fullPath, System.Text.Encoding.UTF8);
    }

    public FileInfoResult GetFileInfo(string path)
    {
        var fullPath = Path.GetFullPath(path);
        var fi = new System.IO.FileInfo(fullPath);

        CurrentFileInfo = new FileInfoResult
        {
            Name = fi.Name,
            FullPath = fi.FullName,
            Size = fi.Length,
            LastModified = fi.LastWriteTime
        };

        return CurrentFileInfo;
    }
}
