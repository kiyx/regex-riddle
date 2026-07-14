import { randomUUID } from 'node:crypto';
import { expect, request, test  } from '@playwright/test';

const API = 'http://localhost:8080';
const PASS = 'TestPassword123!';

async function signupUser(uid: string)
{
  const ctx = await request.newContext({ baseURL: API });
  const res = await ctx.post('/auth/signup', {
    data: { username: `e2e${uid}`, email: `e2e${uid}@test.com`, password: PASS, confirmPassword: PASS },
  });
  const responseText = await res.text();
  if (!res.ok() && !responseText.includes('già in uso'))
    throw new Error(`Signup failed: ${responseText}`);
  const login = await ctx.post('/auth/login', {
    data: { username: `e2e${uid}`, password: PASS },
  });
  const body = await login.json() as { token: string };
  await ctx.dispose();
  return body.token;
}

async function setAuth(page: import('@playwright/test').Page, token: string, username: string)
{
  await page.addInitScript((data: { token: string; username: string }) =>
  {
    localStorage.setItem('regexriddle_auth', JSON.stringify({
      token: data.token,
      user: { username: data.username, email: '', avatar: null },
    }));
  }, { token, username });
}

test.describe('RegexRiddle E2E', () =>
{
  test.setTimeout(60000);

  /* ========== 1. Registrazione via form ========== */
  test('1. Registrazione nuovo utente via form', async ({ page }) =>
  {
    const uid = randomUUID();
    await page.goto('/signup');
    await page.fill('#username', `e2euser${uid}`);
    await page.fill('#email', `e2e${uid}@test.com`);
    await page.fill('#password', PASS);
    await page.fill('#confirmPassword', PASS);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
    await expect(page.locator('header.navbar')).toContainText(`e2euser${uid}`);
  });

  /* ========== 2. Login e logout ========== */
  test('2. Login e logout', async ({ page }) =>
  {
    const uid = randomUUID();
    await signupUser(uid);
    await page.goto('/login');
    await page.fill('#username', `e2e${uid}`);
    await page.fill('#password', PASS);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
    await expect(page.locator('header.navbar')).toContainText(`e2e${uid}`);
    await page.getByRole('button', { name: 'Esci' }).click();
    await expect(page.getByRole('link', { name: 'Accedi' }).first()).toBeVisible();
  });

  /* ========== 3. Landing page ========== */
  test('3. Landing page accessibile a utenti non autenticati', async ({ page }) =>
  {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Scopri il Pattern');
    await expect(page.locator('main').getByRole('link', { name: 'Inizia Gratis' })).toBeVisible();
    await expect(page.locator('main').getByRole('link', { name: 'Accedi' })).toBeVisible();
  });

  /* ========== 4. How to play ========== */
  test('4. Pagina Come si gioca con tab interattivi', async ({ page }) =>
  {
    await page.goto('/how-to-play');
    await expect(page.getByRole('heading', { name: 'Come si gioca' })).toBeVisible();
    await page.locator('button.btn', { hasText: 'Creare' }).click();
    await expect(page.getByRole('heading', { name: 'Creare una Sfida' })).toBeVisible();
    await page.locator('button.btn', { hasText: 'Regex 101' }).click();
    await expect(page.getByRole('heading', { name: 'Guida Rapida Regex' })).toBeVisible();
  });

  /* ========== 5. Creazione sfida wizard ========== */
  test('5. Creazione sfida wizard a step', async ({ page }) =>
  {
    const uid = randomUUID();
    const token = await signupUser(uid);
    await setAuth(page, token, `e2e${uid}`);
    await page.goto('/challenges/create');
    await page.waitForSelector('#title', { state: 'visible' });
    await page.fill('#title', 'E2E Test Vocali');
    await page.fill('#desc', 'Indovina le vocali');
    await page.getByRole('button', { name: 'Avanti' }).click();
    await expect(page.locator('#regex')).toBeVisible();
    await page.fill('#regex', '^[aeiou]+$');
    await page.getByRole('button', { name: 'Avanti' }).click();
    await expect(page.locator('input[name="positiveExample"]')).toBeVisible();
    await page.locator('.create__example-box--pos').locator('input[name="positiveExample"]').fill('aeiou');
    await page.locator('.create__example-box--neg').locator('input[name="negativeExample"]').fill('xyz');
    await page.getByRole('button', { name: 'Avanti' }).click();
    await expect(page.locator('.controls-group', { hasText: 'Positive' }).locator('input[placeholder="+"]').first()).toBeVisible();
    await page.locator('.controls-group', { hasText: 'Positive' }).locator('input[placeholder="+"]').first().fill('aei');
    await page.locator('.controls-group', { hasText: 'Negative' }).locator('input[placeholder="-"]').first().fill('bcd');
    await page.locator('button[type="submit"]').waitFor({ state: 'visible' });
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/.*challenges\/(?!create)/, { timeout: 15000 });
    await expect(page.locator('h1')).toContainText('E2E Test Vocali');
  });

  /* ========== 6. Dettaglio sfida autore ========== */
  test('6. Dettaglio sfida mostra esempi e stato non risolto', async ({ page }) =>
  {
    const uid = randomUUID();
    const token = await signupUser(uid);
    await setAuth(page, token, `e2e${uid}`);
    await page.goto('/challenges/create');
    await page.waitForSelector('#title', { state: 'visible' });
    await page.fill('#title', 'E2E Detail');
    await page.getByRole('button', { name: 'Avanti' }).click();
    await expect(page.locator('#regex')).toBeVisible();
    await page.fill('#regex', '^[a-z]+$');
    await page.getByRole('button', { name: 'Avanti' }).click();
    await expect(page.locator('input[name="positiveExample"]')).toBeVisible();
    await page.locator('.create__example-box--pos').locator('input[name="positiveExample"]').fill('abc');
    await page.locator('.create__example-box--neg').locator('input[name="negativeExample"]').fill('123');
    await page.getByRole('button', { name: 'Avanti' }).click();
    await expect(page.locator('.controls-group', { hasText: 'Positive' }).locator('input[placeholder="+"]').first()).toBeVisible();
    await page.locator('.controls-group', { hasText: 'Positive' }).locator('input[placeholder="+"]').first().fill('hello');
    await page.locator('.controls-group', { hasText: 'Negative' }).locator('input[placeholder="-"]').first().fill('456');
    await page.locator('button[type="submit"]').waitFor({ state: 'visible' });
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/.*challenges\/(?!create)/, { timeout: 15000 });

    await expect(page.locator('h1')).toContainText('E2E Detail');

    const examplesCard = page.locator('.card').filter({ has: page.getByRole('heading', { name: 'Esempi' }) });
    await expect(examplesCard.locator('code', { hasText: 'abc' })).toBeVisible();
    await expect(examplesCard.locator('code', { hasText: '123' })).toBeVisible();

    await expect(page.getByText('La tua Sfida')).toBeVisible();
  });

  /* ========== 7. Tentativo errato ========== */
  test('7. Tentativo errato mostra statistiche parziali', async ({ page, request }) =>
  {
    const uidA = randomUUID();
    const uidB = randomUUID();
    const tokenA = await signupUser(uidA);

    const createRes = await request.post(`${API}/challenges`, {
      headers: { Authorization: `Bearer ${tokenA}` },
      data: {
        title: 'E2E Attempt',
        secretRegex: '^[0-9]+$',
        positiveExample: '123',
        negativeExample: 'abc',
        positiveControls: ['456'],
        negativeControls: ['xyz'],
      },
    });
    const challenge = await createRes.json() as { id: string };

    const tokenB = await signupUser(uidB);
    await setAuth(page, tokenB, `e2e${uidB}`);
    await page.goto(`/challenges/${challenge.id}`);
    await page.fill('#guess-input', '^[a-z]+$');
    await page.locator('#guess-input').press('Tab');
    await page.getByRole('button', { name: 'Invia' }).click();
    await expect(page.getByText('Non ancora', { exact: false })).toBeVisible();
    await expect(page.getByText(/Controlli positivi/)).toBeVisible();
    await expect(page.getByText(/Controlli negativi/)).toBeVisible();
  });

  /* ========== 8. Risoluzione + blocco ========== */
  test('8. Risoluzione corretta blocca ulteriori tentativi', async ({ page, request }) =>
  {
    const uidA = randomUUID();
    const uidB = randomUUID();
    const tokenA = await signupUser(uidA);

    const createRes = await request.post(`${API}/challenges`, {
      headers: { Authorization: `Bearer ${tokenA}` },
      data: {
        title: 'E2E Solve',
        secretRegex: '^hello$',
        positiveExample: 'hello',
        negativeExample: 'world',
        positiveControls: ['hello'],
        negativeControls: ['bye'],
      },
    });
    const challenge = await createRes.json() as { id: string };

    const tokenB = await signupUser(uidB);
    await request.post(`${API}/challenges/${challenge.id}/attempt`, {
      headers: { Authorization: `Bearer ${tokenB}` },
      data: { proposedRegex: '^hello$' },
    });

    await setAuth(page, tokenB, `e2e${uidB}`);
    await page.goto(`/challenges/${challenge.id}`);
    await expect(page.getByText('Hai risolto questa sfida!')).toBeVisible();
    await expect(page.locator('#guess-input')).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Invia' })).not.toBeVisible();
    await page.reload();
    await expect(page.getByText('Hai risolto questa sfida!')).toBeVisible();
  });

  /* ========== 9. Classifica ========== */
  test('9. Classifica mostra utenti e punteggi', async ({ page }) =>
  {
    await page.goto('/leaderboard');
    await expect(page.getByRole('heading', { name: /Classifica/i })).toBeVisible();
    const emptyState = page.getByText('Classifica vuota');
    const table = page.locator('table');
    await expect(emptyState.or(table)).toBeVisible();
  });

  test('9b. Classifica paginazione numeri continui', async ({ page }) =>
  {
    await page.goto('/leaderboard');
    await expect(page.getByRole('heading', { name: /Classifica/i })).toBeVisible();
    const pagination = page.locator('nav[aria-label="Paginazione classifica"]');
    if (await pagination.isVisible().catch(() => false))
    {
      const firstRank = page.locator('table tbody tr:first-child td:first-child');
      const rank1 = await firstRank.textContent() ?? '';
      expect(rank1.trim()).toBe('1');
      await page.getByRole('button', { name: 'Pagina successiva' }).click();
      const nextFirstRank = page.locator('table tbody tr:first-child td:first-child');
      await expect(nextFirstRank).not.toHaveText('1');
      const rankNext = await nextFirstRank.textContent() ?? '';
      expect(Number(rankNext.trim())).toBeGreaterThan(1);
    }
  });

  /* ========== 10. Profilo utente ========== */
  test('10. Profilo utente mostra dati personali', async ({ page }) =>
  {
    const uid = randomUUID();
    const token = await signupUser(uid);
    await setAuth(page, token, `e2e${uid}`);
    await page.goto('/profile');
    await expect(page.getByRole('heading', { name: /Impostazioni Account/i })).toBeVisible();
    await expect(page.getByText(`e2e${uid}`)).toBeVisible();
  });
});
