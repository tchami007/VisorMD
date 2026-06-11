namespace VisorMD;

public class FileWatcher
{
    private FileSystemWatcher? _watcher;
    private string? _watchedPath;
    private DateTime _lastEvent;

    public void Watch(string path, Action onChange)
    {
        Stop();

        try
        {
            var directory = Path.GetDirectoryName(path);
            var fileName = Path.GetFileName(path);

            if (string.IsNullOrEmpty(directory) || string.IsNullOrEmpty(fileName))
                return;

            _watchedPath = path;

            _watcher = new FileSystemWatcher(directory, fileName)
            {
                EnableRaisingEvents = true,
                NotifyFilter = NotifyFilters.LastWrite | NotifyFilters.Size
            };

            _watcher.Changed += (_, _) =>
            {
                var now = DateTime.UtcNow;
                if ((now - _lastEvent).TotalMilliseconds < 500) return;
                _lastEvent = now;

                Thread.Sleep(100);
                onChange();
            };
        }
        catch
        {
            // FileWatcher is non-critical; silently ignore errors
        }
    }

    public void Stop()
    {
        _watcher?.Dispose();
        _watcher = null;
        _watchedPath = null;
    }
}
