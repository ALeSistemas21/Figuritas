import { test, expect } from '@playwright/test';

test.describe.serial('Gestión de Propuestas', () => {
  
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

  test('debe cargar el centro de intercambios', async ({ page }) => {
    // Navegar a Propuestas usando el menú principal o inferior
    await page.getByRole('button', { name: 'Mis Tratos' }).click({ force: true });
    
    // Verificamos títulos de las secciones de propuestas
    await expect(page.getByText('Propuestas Recibidas')).toBeVisible();
    await expect(page.getByText('Propuestas Enviadas')).toBeVisible();
  });
});
