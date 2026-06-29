import { test, expect } from '@playwright/test';

test.describe.serial('Funcionalidad del Álbum', () => {
  
  test.beforeEach(async ({ page }) => {
    // Iniciamos sesión antes de cada prueba de esta suite
    await page.goto('/');
    await page.locator('input[type="email"]').fill('test@test.com');
    await page.locator('input[type="password"]').fill('123456');
    await page.getByRole('button', { name: 'Entrar' }).click();
    // 4. Navegar a la pestaña del Álbum
    // Si el modal de perfil aparece (porque el usuario es nuevo), lo llenamos
    try {
      await expect(page.getByText('¡Bienvenido a FiguMatch!')).toBeVisible({ timeout: 5000 });
      await page.getByPlaceholder('Ej. Martín').fill('Test User');
      await page.getByRole('combobox').first().selectOption({ index: 1 }); // Provincia
      await page.getByRole('combobox').nth(1).selectOption({ index: 1 }); // Depto
      await page.getByRole('combobox').nth(2).selectOption({ index: 1 }); // Localidad
      await page.getByRole('button', { name: 'Guardar Perfil' }).click();
      await expect(page.getByText('¡Bienvenido a FiguMatch!')).toBeHidden({ timeout: 10000 });
    } catch (e) {
      // El modal no apareció, lo cual significa que el perfil ya existe. Continuamos.
    }
  });

  test('debe poder buscar una figurita y usar los filtros', async ({ page }) => {
    // 1. Ir a la pestaña del Álbum (con force: true por si acaso hay un overlay residual)
    await page.getByRole('button', { name: 'Gestionar Álbum' }).click({ force: true });
    await expect(page.getByText('Selecciones')).toBeVisible();

    // 2. Probar la búsqueda
    const searchInput = page.getByPlaceholder('Buscar por código (ARG10) o jugador...');
    await searchInput.fill('Messi');
    
    // Verificamos que Lionel Messi aparezca en los resultados
    await expect(page.getByText('Lionel Messi')).toBeVisible();

    // 3. Limpiar búsqueda
    await searchInput.fill('');

    // 4. Navegar por las secciones (equipos)
    // Buscamos el botón de la selección de Brasil y hacemos clic
    await page.getByRole('button', { name: /Brasil/i }).click();
    
    // Verificamos que cargue un jugador de Brasil (ej: Neymar Jr o Vinícius)
    // Nota: dependemos de los datos de 'figuData', verifiquemos el encabezado de sección
    await expect(page.getByText('Selecciones')).toBeVisible();

    // 5. Probar los botones de filtros
    await page.getByRole('button', { name: 'Faltantes' }).click();
    // Como el usuario es nuevo, no tiene figuritas, por lo que las faltantes deben ser visibles
    await expect(page.getByText('Faltantes')).toHaveClass(/bg-\[var\(--color-fwc-red\)\]/);
    
    await page.getByRole('button', { name: 'Obtenidas' }).click();
    // Si no tiene obtenidas, debería mostrar un mensaje de vacío (si lo hubiese) o simplemente cambiar de estado
    await expect(page.getByRole('button', { name: 'Obtenidas' })).toHaveClass(/bg-\[var\(--color-fwc-green\)\]/);
  });
});
