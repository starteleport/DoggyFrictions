import { test, expect } from './fixtures';

test.describe('PWA', () => {
  test('the app is installable: manifest, icons and theme are in place', async ({ page, request }) => {
    await page.goto('/');

    const href = await page.locator('link[rel="manifest"]').getAttribute('href');
    const response = await request.get(href!);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/manifest+json');
    const manifest = await response.json();

    expect(manifest).toMatchObject({ name: 'Doggy Frictions', start_url: '/', display: 'standalone', theme_color: '#009688' });
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', manifest.theme_color);
    // Chrome asks for a 192px and a 512px icon; Android masks the maskable one into its own shape.
    expect(manifest.icons.map((icon: any) => `${icon.sizes} ${icon.purpose}`))
      .toEqual(['192x192 any', '512x512 any', '512x512 maskable']);
    for (const icon of manifest.icons) {
      const image = await request.get(icon.src);
      expect(image.status(), icon.src).toBe(200);
      expect(image.headers()['content-type']).toBe('image/png');
    }
    const appleIcon = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
    expect((await request.get(appleIcon!)).status()).toBe(200);
  });

  test('the app shell opens without a connection and says the server is unreachable', async ({ app, api, page, context }) => {
    const session = await api.createSession(['Ann', 'Bob']);

    // A single visit is enough to be able to start offline later.
    await app.open('/Sessions');
    await expect(page.getByTestId('session-row').filter({ hasText: session.Name })).toBeVisible();
    await app.waitForOfflineShell();

    await context.setOffline(true);
    await page.reload();

    // The page, its scripts and styles come from the cache...
    await expect(page.locator('.navbar-brand')).toBeVisible();
    await expect(page.locator('.navbar')).toHaveCSS('background-color', 'rgb(0, 150, 136)');
    // ...while data is never cached, so the list cannot load and the app says why.
    await expect(app.errorToast()).toContainText('Нет соединения с сервером.');
    await expect(page.getByTestId('session-row')).toHaveCount(0);

    await context.setOffline(false);
    await page.reload();
    await app.loaded();
    await expect(page.getByTestId('session-row').filter({ hasText: session.Name })).toBeVisible();
  });

  test('data requests bypass the service worker cache', async ({ app, api, page }) => {
    const session = await api.createSession(['Ann', 'Bob']);
    await app.open('/Sessions');
    await app.waitForOfflineShell();
    // Load data once more through the worker, so a wrongly cached API response would show up below.
    await page.reload();
    await app.loaded();
    await page.waitForLoadState('networkidle');

    const cached: string[] = await page.evaluate(async () => {
      const keys = await (await caches.open('doggy-frictions-v1')).keys();
      return keys.map(request => new URL(request.url).pathname);
    });

    expect(cached).toContain('/');
    expect(cached.filter(path => /^\/api\//i.test(path))).toEqual([]);

    // A change made elsewhere shows up on the next load: nothing stale is served.
    await page.request.delete(`/api/Sessions/${session.Id}`);
    await page.reload();
    await app.loaded();
    await expect(page.getByTestId('session-row').filter({ hasText: session.Name })).toHaveCount(0);
  });

  test('while online a cached copy never wins over the server', async ({ app, page }) => {
    await app.open('/Sessions');
    await app.waitForOfflineShell();

    // What a previous deployment would have left behind: templates that no longer match the scripts.
    const replaced = await page.evaluate(async () => {
      const cache = await caches.open('doggy-frictions-v1');
      const templates = (await cache.keys()).find(request => new URL(request.url).pathname === '/Templates/Get');
      if (!templates) return false;
      await cache.put(templates, new Response(
        '<script type="text/html" id="sessions-template"><div data-testid="sessions-view">STALE</div></script>',
        { headers: { 'Content-Type': 'text/html' } }));
      return true;
    });
    expect(replaced, 'templates were expected in the cache').toBe(true);

    await page.reload();
    await app.loaded();

    await expect(page.getByTestId('sessions-view')).not.toContainText('STALE');
    await expect(page.getByTestId('create-session-button')).toBeVisible();
  });
});
