using System.Drawing;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Text.Json;
using Photino.NET;

namespace VisorMD;

class Program
{
    static readonly HashSet<string> ValidThemes = new(StringComparer.OrdinalIgnoreCase)
    {
        "light", "dark", "sepia", "dracula", "highcontrast", "ocean", "matrix", "starwars"
    };

    [DllImport("kernel32.dll")]
    static extern bool FreeConsole();

    static string? s_wwwrootPath;
    static string? s_pendingFile;
    static string? s_pendingTheme;
    static string? s_lastDirectory;
    static string s_logPath = Path.Combine(Path.GetTempPath(), "VisorMD.log");

    static void Log(string msg)
    {
        File.AppendAllText(s_logPath, $"[{DateTime.Now:HH:mm:ss}] {msg}\n");
    }

    [STAThread]
    static void Main(string[] args)
    {
        File.WriteAllText(s_logPath, $"=== VisorMD started {DateTime.Now} ===\n");
        Log($"Args: {string.Join(", ", args)}");

        // Parse CLI arguments
        var positional = new List<string>();
        for (int i = 0; i < args.Length; i++)
        {
            switch (args[i])
            {
                case "--theme":
                    if (i + 1 < args.Length)
                    {
                        i++;
                        s_pendingTheme = args[i].ToLowerInvariant();
                        if (!ValidThemes.Contains(s_pendingTheme))
                        {
                            Console.Error.WriteLine($"Error: tema desconocido '{s_pendingTheme}'.");
                            Console.Error.WriteLine($"Temas validos: {string.Join(", ", ValidThemes)}");
                            Environment.Exit(1);
                        }
                    }
                    else
                    {
                        Console.Error.WriteLine("Error: --theme requiere un nombre de tema.");
                        Environment.Exit(1);
                    }
                    break;

                case "--help":
                case "-h":
                    Console.WriteLine(@"VisorMD — Visor de archivos Markdown
Uso: visormd [opciones] [archivo]

Opciones:
  --theme <tema>    Tema visual (light, dark, sepia, dracula, highcontrast, ocean, matrix, starwars)
  --help, -h        Muestra esta ayuda

Ejemplos:
  visormd documento.md
  visormd --theme dracula guia.md");
                    Environment.Exit(0);
                    break;

                default:
                    if (!args[i].StartsWith("--"))
                        positional.Add(args[i]);
                    break;
            }
        }

        if (positional.Count > 0)
        {
            s_pendingFile = positional[0];
            if (!File.Exists(s_pendingFile))
            {
                Console.Error.WriteLine($"Error: archivo no encontrado: {s_pendingFile}");
                Environment.Exit(1);
            }
        }

        s_wwwrootPath = ExtractWwwroot();

        var fileService = new FileService();
        var fileWatcher = new FileWatcher();

        FreeConsole();

        PhotinoWindow? window = null;
        window = new PhotinoWindow()
            .SetTitle("VisorMD")
            .SetUseOsDefaultSize(false)
            .SetSize(new Size(1200, 800))
            .Center()
            .SetResizable(true)
            .RegisterWebMessageReceivedHandler((sender, message) =>
            {
                Log($"[IPC] Received: {message}");
                var w = (PhotinoWindow)sender!;
                using var doc = JsonDocument.Parse(message);
                var msg = doc.RootElement;
                var type = msg.GetProperty("type").GetString();
                Log($"[IPC] Type: {type}");

                switch (type)
                {
                    case "app-ready":
                        if (s_pendingTheme != null)
                        {
                            var themeMsg = JsonSerializer.Serialize(
                                new SetThemeMessage { Theme = s_pendingTheme },
                                AppJsonContext.Default.SetThemeMessage);
                            w.SendWebMessage(themeMsg);
                            s_pendingTheme = null;
                        }
                        if (s_pendingFile != null && File.Exists(s_pendingFile))
                        {
                            var fullPath = Path.GetFullPath(s_pendingFile);
                            Log($"Opening pending file: {fullPath}");
                            OpenFile(w, fileService, fileWatcher, fullPath);
                            s_pendingFile = null;
                        }
                        break;

                    case "open-file":
                        var path = msg.GetProperty("path").GetString();
                        if (path != null) OpenFile(w, fileService, fileWatcher, path);
                        break;

                    case "show-open-dialog":
                        Log($"show-open-dialog handler started, lastDir={s_lastDirectory}");
                        try
                        {
                            var selected = w.ShowOpenFile(
                                title: "Seleccionar archivo Markdown",
                                defaultPath: s_lastDirectory,
                                multiSelect: false,
                                filters: new[] { ("Markdown files", new[] { "*.md", "*.markdown" }) }
                            );
                            Log($"ShowOpenFile returned: {selected?.Length ?? -1} items");
                            if (selected != null && selected.Length > 0)
                            {
                                var selPath = selected[0];
                                Log($"Selected path: {selPath}");
                                if (selPath != null) OpenFile(w, fileService, fileWatcher, selPath);
                            }
                        }
                        catch (Exception ex)
                        {
                            Log($"ShowOpenFile error: {ex}");
                        }
                        break;

                    case "get-file-info":
                        SendFileInfo(w, fileService);
                        break;
                }
            })
            .Load(Path.Combine(s_wwwrootPath, "index.html"));

        window.WaitForClose();
    }

    static string ExtractWwwroot()
    {
        var targetDir = Path.Combine(Path.GetTempPath(), "VisorMD", "wwwroot");
        var asm = Assembly.GetExecutingAssembly();
        var prefix = typeof(Program).Assembly.GetName().Name + ".wwwroot.";

        if (Directory.Exists(targetDir))
            Directory.Delete(targetDir, true);
        Directory.CreateDirectory(targetDir);

        var allResources = asm.GetManifestResourceNames()
            .Where(r => r.StartsWith(prefix))
            .ToList();

        foreach (var resource in allResources)
        {
            var relative = resource[prefix.Length..].Replace(':', Path.DirectorySeparatorChar);
            var targetFile = Path.GetFullPath(Path.Combine(targetDir, relative));

            if (!targetFile.StartsWith(targetDir, StringComparison.Ordinal))
                continue;

            var parentDir = Path.GetDirectoryName(targetFile);
            if (parentDir != null) Directory.CreateDirectory(parentDir);

            using var stream = asm.GetManifestResourceStream(resource)!;
            using var fileStream = File.Create(targetFile);
            stream.CopyTo(fileStream);
        }

        return targetDir;
    }

    static void OpenFile(PhotinoWindow window, FileService fileService, FileWatcher fileWatcher, string path)
    {
        Log($"OpenFile called with: {path}");
        if (!File.Exists(path))
        {
            Log($"File does not exist: {path}");
            return;
        }

        var dir = Path.GetDirectoryName(Path.GetFullPath(path));
        if (dir != null) s_lastDirectory = dir;
        Log($"Last directory set to: {s_lastDirectory}");

        var content = fileService.ReadFile(path);
        var info = fileService.GetFileInfo(path);
        Log($"File read OK: {info.Name}, size={info.Size}");

        var response = JsonSerializer.Serialize(new FileLoadedMessage
        {
            Content = content,
            FileName = info.Name,
            FilePath = info.FullPath,
            FileSize = info.Size
        }, AppJsonContext.Default.FileLoadedMessage);

        Log($"Sending WebMessage, length={response.Length}");
        window.SendWebMessage(response);
        Log("WebMessage sent");
        window.SetTitle($"VisorMD - {info.Name}");

        var fileName = info.Name;
        fileWatcher.Watch(path, () =>
        {
            var newContent = fileService.ReadFile(path);
            var reloadMsg = JsonSerializer.Serialize(new FileChangedMessage
            {
                Content = newContent,
                FileName = fileName,
                FilePath = path
            }, AppJsonContext.Default.FileChangedMessage);
            window.SendWebMessage(reloadMsg);
        });
    }

    static void SendFileInfo(PhotinoWindow window, FileService fileService)
    {
        var info = fileService.CurrentFileInfo;
        if (info == null) return;

        var response = JsonSerializer.Serialize(new FileInfoMessage
        {
            FileName = info.Name,
            FilePath = info.FullPath,
            FileSize = info.Size
        }, AppJsonContext.Default.FileInfoMessage);
        window.SendWebMessage(response);
    }
}