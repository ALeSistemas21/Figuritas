# Pruebas End-to-End (E2E) con Playwright

Bienvenido a la carpeta de pruebas de nuestra aplicación. Aquí utilizamos **Playwright**, un framework de pruebas moderno desarrollado por Microsoft, para simular la interacción real de un usuario con el navegador y asegurarnos de que toda la aplicación funciona como se espera, desde el inicio de sesión hasta el intercambio de figuritas.

## Estructura de esta Carpeta

* `landing.spec.ts`: Pruebas sobre la interfaz de inicio (antes de loguearse). Verifica que la página cargue y que el formulario de Auth esté visible.
* `auth-dashboard.spec.ts`: Pruebas de autenticación y navegación. Utiliza el usuario de prueba para iniciar sesión y navegar a través de las diferentes pestañas del Dashboard, Álbum, Matches, etc.

## ¿Cómo ejecutar las pruebas?

Asegúrate de que la aplicación y la base de datos estén listas. Al usar Playwright, el archivo `playwright.config.ts` está configurado para levantar automáticamente el servidor local (`npm run dev`) antes de correr las pruebas, así que no necesitas levantarlo manualmente.

1. **Ejecutar tests de forma silenciosa (Headless):**
   ```bash
   npx playwright test
   ```

2. **Ejecutar tests de forma visual (con UI interactiva):**
   ```bash
   npx playwright test --ui
   ```
   *Esto abrirá una interfaz gráfica muy útil donde puedes ver cómo el navegador hace clics mágicamente y te permite retroceder en el tiempo para debugear.*

## Entendiendo `auth-dashboard.spec.ts`

Esta es nuestra prueba principal. Se compone de varios pasos secuenciales:

1. **`page.goto('/')`**: Navega a la ruta principal de la app.
2. **`page.fill(...)`**: Rellena automáticamente los campos de correo y contraseña usando nuestro usuario de prueba (`test@test.com`).
3. **`page.click('button[type="submit"]')`**: Simula el clic de inicio de sesión.
4. **`expect(page.getByText('¡Hola')).toBeVisible()`**: Espera a que cargue el Dashboard verificando que aparezca el saludo de bienvenida.
5. Luego, localiza cada uno de los botones de navegación (Álbum, Matches, Amigos) y simula clics sobre ellos, verificando que la interfaz cambie al componente correspondiente usando aserciones de visibilidad.
