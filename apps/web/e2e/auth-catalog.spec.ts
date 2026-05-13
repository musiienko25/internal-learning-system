import { expect, test } from '@playwright/test';

test.describe('Реєстрація та каталог', () => {
  test('новий користувач бачить каталог після реєстрації', async ({
    page,
  }) => {
    const suffix = Date.now();
    const email = `e2e-${suffix}@example.test`;

    await page.goto('/register');
    await expect(page.getByRole('heading', { name: 'Реєстрація' })).toBeVisible();

    await page.locator('#register-name').fill(`E2E User ${suffix}`);
    await page.locator('#register-email').fill(email);
    await page.locator('#register-password').fill('E2EPass123!');
    await page.getByRole('button', { name: 'Створити акаунт' }).click();

    await expect(
      page.getByRole('heading', { name: 'Каталог курсів' }),
    ).toBeVisible({ timeout: 30_000 });
  });

  test('логін існуючого користувача відкриває каталог', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Вхід' })).toBeVisible();

    await page.locator('#login-email').fill('trainer@bank.ua');
    await page.locator('#login-password').fill('Test123!');
    await page.getByRole('button', { name: 'Увійти' }).click();

    await expect(
      page.getByRole('heading', { name: 'Каталог курсів' }),
    ).toBeVisible({ timeout: 30_000 });
  });
});
