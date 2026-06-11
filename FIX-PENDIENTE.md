# VisorMD - Fix Pendiente

## Estado Actual
La app compila y ejecuta, pero el botón 📂 no carga archivos.

## Problema Identificado
El backend **SÍ funciona** correctamente (confirmado por logs):
- Recibe `show-open-dialog` del frontend
- Abre el diálogo nativo de Windows
- Lee el archivo seleccionado
- Ejecuta `SendWebMessage` con el contenido

El problema está en el **frontend**: el mensaje `file-loaded` enviado por `SendWebMessage` **no llega** a `window.external.receiveMessage`.

## Log del Backend (funcionando)
```
[21:43:13] [IPC] Received: {"type":"show-open-dialog"}
[21:43:13] show-open-dialog handler started
[21:43:23] ShowOpenFile returned: 1 items
[21:43:23] Selected path: C:\temp\06_Parámetros.md
[21:43:23] OpenFile called with: C:\temp\06_Parámetros.md
[21:43:23] File read OK: 06_Parámetros.md, size=2495
[21:43:23] Sending WebMessage, length=3018
[21:43:23] WebMessage sent
```

## Fix Aplicado (parcial)
Se corrigió el JSON serialization en `Messages.cs` para usar camelCase:
```csharp
[JsonPropertyName("type")]
public string Type { get; set; } = "file-loaded";
```

## Próximos Pasos para Diagnosticar

1. **Verificar en DevTools** si `receiveMessage` se llama después de seleccionar archivo:
   - Ejecutar `C:\OPENCODE\VisorMD\dist\test3\VisorMD.exe`
   - F12 para abrir DevTools
   - Click en 📂, seleccionar archivo
   - Buscar en consola: `receiveMessage called:`

2. **Si NO aparece el log**: el problema es que PhotinoX `SendWebMessage` no está invocando `window.external.receiveMessage` del frontend. Posibles causas:
   - Race condition: el frontend sobreescribe `receiveMessage` después de que PhotinoX lo configura
   - PhotinoX usa otro mecanismo para enviar mensajes

3. **Si SÍ aparece el log**: verificar que `data.type === 'file-loaded'` matchea

## Archivos Clave
- `src/VisorMD/Program.cs` - Backend con logging a `%TEMP%\VisorMD.log`
- `src/VisorMD/Messages.cs` - DTOs con JsonPropertyName
- `src/VisorMD/wwwroot/src/index.js` - Frontend IPC handler (líneas 98-124)

## Build Actual
Sin AOT (para debugging):
```powershell
cd C:\OPENCODE\VisorMD\src
dotnet publish VisorMD\VisorMD.csproj -c Release -r win-x64 --self-contained -o ..\dist\test3
```

El AOT está comentado en `VisorMD.csproj`:
```xml
<!-- <PublishAot>true</PublishAot> -->
```

## Nota
El CLI funciona: `VisorMD.exe archivo.md` abre el archivo correctamente al inicio (porque usa el mismo `OpenFile` + `SendWebMessage`). Esto sugiere que el problema puede ser timing-related cuando se llama `SendWebMessage` después de que la app ya está corriendo.
