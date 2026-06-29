import { test, expect } from '@playwright/test';

test.describe.serial('Red de Coleccionistas (Amigos)', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('input[type="email"]').fill('test@test.com');
    await page.locator('input[type="password"]').fill('123456');
    await page.getByRole('button', { name: 'Entrar' }).click();

    try {
      await expect(page.getByText('¡Bienvenido a FiguMatch!')).toBeVisible({ timeout: 5000 });
      await page.getByPlaceholder('Ej. Martín').fill('Test User');
      await page.getByRole('combobox').first().selectOption({ index: 1 });
      await page.getByRole('combobox').nth(1).selectOption({ index: 1 });
      await page.getByRole('combobox').nth(2).selectOption({ index: 1 });
      await page.getByRole('button', { name: 'Guardar Perfil' }).click();
      await expect(page.getByText('¡Bienvenido a FiguMatch!')).toBeHidden({ timeout: 10000 });
    } catch (e) {}
  });

  test('debe cargar la vista de red de amigos', async ({ page }) => {
    // Navegar a Red usando el menú principal o inferior
    await page.getByRole('button', { name: 'Amigos' }).click({ force: true });
    
    // Verificamos títulos y UI de añadir amigo
    await expect(page.getByText('Añadir Amigo')).toBeVisible();
    
    // Verificamos el input para el código de usuario
    await expect(page.getByPlaceholder('ID de 6 cifras')).toBeVisible();
    
    // Debería existir un botón para enviar solicitud
    await expect(page.locator('button', { hasText: 'Enviar' })).toBeVisible();
  });
});
