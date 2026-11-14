import { test, expect } from './fixtures';

// The layout grid on a wide screen: breadcrumbs, section headings and tables start at the same
// left edge, and the page title is in the same place on every page.
test('pages share one left edge and put the title in the same place', async ({ app, api, page }) => {
  const session = await api.createSession(['Ann', 'Bob']);
  const action = await api.createAction(session, { description: 'Пицца', payer: 'Ann', amount: 10, consumers: ['Ann', 'Bob'] });

  const titles = new Set<number>();
  for (const route of [
    `/Session/${session.Id}`,
    `/Session/Edit/${session.Id}`,
    `/Session/${session.Id}/Action/${action.Id}`,
    `/Session/${session.Id}/Action/Edit/${action.Id}`,
    `/Session/${session.Id}/Debts`,
  ]) {
    await app.open(route);
    await expect(page.locator('.page-title')).toBeVisible();
    const left = await page.evaluate(() => {
      const x = (selector: string) => Math.round(document.querySelector(selector)!.getBoundingClientRect().left);
      return { crumbs: x('.breadcrumb'), section: x('.jumbotron h4'), table: x('.jumbotron table'), title: x('.page-title') };
    });
    expect([left.crumbs, left.table], `left edges on ${route}`).toEqual([left.section, left.section]);
    titles.add(left.title);
  }
  expect([...titles], 'where the page title starts').toHaveLength(1);
});
