# ADR 001: IPC con PhotinoX — `receiveMessage` es función de registro

## Contexto

PhotinoX expone `window.external.receiveMessage` no como una propiedad a la que se asigna un handler, sino como una **función de registro** a la que se le pasa un callback.

## Problema

El código original sobrescribía la función:

```js
window.external.receiveMessage = function(msg) { ... };
```

Esto rompía el puente IPC porque PhotinoX internamente llamaba a su propia implementación de `receiveMessage`, y al ser reemplazada por el nuevo valor, el mecanismo de comunicación nativo dejaba de funcionar.

## Solución

Usar `receiveMessage` como función de registro, pasándole el callback:

```js
window.external.receiveMessage(function(msg) {
  // manejar mensaje
});
```

Manteniendo un fallback por si el entorno no tiene el patrón de registro:

```js
if (window.external?.sendMessage && window.external?.receiveMessage) {
  window.external.receiveMessage(function(msg) {
    receiveMessage(msg);
  });
} else {
  window.external = window.external || {};
  window.external.receiveMessage = receiveMessage;
}
```

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `src/VisorMD/wwwroot/src/index.js` | Usar `receiveMessage(callback)` en vez de asignar la propiedad |
| `src/VisorMD/Messages.cs` | Agregar `[JsonSourceGenerationOptions(CamelCase)]` para que el JSON use camelCase |
| `src/VisorMD/FileWatcher.cs` | Validar que path no sea null/empty y que el directorio exista antes de crear FileSystemWatcher |
| `src/VisorMD/wwwroot/index.html` | Remover `<link>` a `dist/bundle.css` que no existe |

## Consecuencias

- El IPC funciona correctamente en PhotinoX manteniendo el mecanismo nativo intacto.
- Si en el futuro PhotinoX cambia su API, el fallback cubre el caso.
- Se evitan crashes por archivos no encontrados o rutas inválidas en el FileWatcher.
