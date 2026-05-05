# Instrucciones para publicar en NPM

El SDK ha sido preparado para ser publicado en el NPM Registry bajo el scope `@divisas-lat` (como `@divisas-lat/js-sdk`).
Para subirlo exitosamente, sigue estos pasos:

1. **Compilar el proyecto**
   Asegúrate de que la carpeta `dist/` esté generada y optimizada.
   ```bash
   npm run build
   ```

2. **Login a NPM**
   Asegúrate de estar logueado en tu terminal:
   ```bash
   npm login
   ```

3. **Ignorar archivos locales**
   Asegúrate de que tus credenciales (`.env` si lo creas) estén en `.gitignore`.
   Los archivos exportados ya están controlados por el flag `outDir` y los exports en `package.json`.

4. **Publicación**
   Ejecuta:
   ```bash
   npm publish --access public
   ```
   *Nota: La bandera `--access public` es necesaria la primera vez si usas un namespace con `@`.*
