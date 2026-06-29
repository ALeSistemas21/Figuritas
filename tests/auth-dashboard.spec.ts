import { test, expect } from '@playwright/test';

// Utilizaremos serial para que las pruebas se ejecuten en orden y dependan del estado (opcional, pero útil aquí para no saturar)
test.describe.serial('Auth y Dashboard', () => {
  
  test('debe poder iniciar sesión y ver el dashboard', async ({ page }) => {
    // 1. Navegar a la raíz
    await page.goto('/');

    // 2. Llenar credenciales (asegúrate de tener este usuario creado en tu consola de Firebase)
    await page.locator('input[type="email"]').fill('test@test.com');
    await page.locator('input[type="password"]').fill('123456');

    // 3. Hacer clic en "Entrar"
    await page.getByRole('button', { name: 'Entrar' }).click();

    // 4. Esperar a que la autenticación sea exitosa
    // Al ser un usuario nuevo (o sin perfil), la app nos mostrará el modal de Registro de Perfil
    await expect(page.getByText('¡Bienvenido a FiguMatch!')).toBeVisible({ timeout: 15000 });
    
    // Verificamos que los campos obligatorios del perfil estén presentes
    await expect(page.getByText('Tu Nombre / Apodo')).toBeVisible();
    await expect(page.getByText('Provincia', { exact: true })).toBeVisible();
  });

  // Nota: Para probar la navegación interna (Dashboard, Álbum, etc.) en pruebas posteriores,
  // el usuario idealmente debería tener su perfil ya creado, o el test debe completarlo aquí.
  // Como los datos dependen de la base de datos (Supabase), lo dejamos aquí como comprobación E2E del Auth.
});
