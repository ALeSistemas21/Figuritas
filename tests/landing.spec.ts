import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('debe cargar la página de inicio correctamente', async ({ page }) => {
    // 1. Navegar a la página principal
    await page.goto('/');

    // 2. Verificar que el título principal de la aplicación sea visible
    await expect(page.getByText('FiguMatch')).toBeVisible();
    await expect(page.getByText('26')).toBeVisible();

    // 3. Verificar que los selectores de tabulación (Iniciar Sesión / Crear Cuenta) estén presentes
    await expect(page.getByRole('button', { name: 'Iniciar Sesión' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Crear Cuenta' })).toBeVisible();

    // 4. Verificar que el formulario de correo electrónico esté presente
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    // 5. Verificar que el botón de inicio de sesión con Google esté presente
    await expect(page.getByRole('button', { name: /Continuar con Google/i })).toBeVisible();
  });

  test('debe poder cambiar al modo de registro', async ({ page }) => {
    await page.goto('/');

    // 1. Hacer clic en "Crear Cuenta"
    await page.getByRole('button', { name: 'Crear Cuenta' }).click();

    // 2. Verificar que cambien los textos y aparezca "Confirmar Contraseña"
    await expect(page.getByText('Registrate para empezar a intercambiar')).toBeVisible();
    await expect(page.getByText('Confirmar Contraseña')).toBeVisible();
    
    // Debería haber dos campos de contraseña ahora
    await expect(page.locator('input[type="password"]')).toHaveCount(2);

    // 3. El botón de envío debería decir "Registrarme"
    await expect(page.getByRole('button', { name: 'Registrarme' })).toBeVisible();
  });
});
