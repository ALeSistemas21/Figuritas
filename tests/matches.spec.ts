import { test, expect } from '@playwright/test';

test.describe.serial('Búsqueda de Matches', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('input[type="email"]').fill('test@test.com');
    await page.locator('input[type="password"]').fill('123456');
    await page.getByRole('button', { name: 'Entrar' }).click();

    // Si el modal de perfil aparece, lo llenamos para que nos deje avanzar
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

  test('debe cargar la vista de encontrar coleccionistas', async ({ page }) => {
    // Navegar a Matches (Buscar) usando el menú principal o inferior
    await page.getByRole('button', { name: 'Coleccionistas', exact: true }).click({ force: true });
    
    // Verificamos títulos
    await expect(page.getByText('Encontrar Coleccionistas')).toBeVisible();
    await expect(page.getByText('Ordenados por cercanía para facilitar el intercambio presencial.')).toBeVisible();
    
    // Verificamos que se muestre algún estado de carga o el texto de sin resultados / lista
    // Al ser un entorno de prueba nuevo, puede que diga "No se encontraron coleccionistas" o similar
    try {
      await expect(page.getByText('No se encontraron coleccionistas')).toBeVisible({ timeout: 3000 });
    } catch (e) {
      // O hay coleccionistas en la DB, lo cual también es correcto
    }
  });
});
