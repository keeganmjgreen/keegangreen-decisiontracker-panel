import { test, expect } from '@grafana/plugin-e2e';

test('should render nested evaluated expressions', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
}) => {
  const dashboard = await readProvisionedDashboard({
    fileName: 'dashboard.json',
  });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '1' });
  await expect(panelEditPage.panel.locator).toContainText('x := true');
});

test('should enable expanding/collapsing of evaluated expressions via buttons', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
  page,
}) => {
  const dashboard = await readProvisionedDashboard({
    fileName: 'dashboard.json',
  });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '1' });
  panelEditPage.panel.locator
    .getByTestId('51909b4d-7469-4244-bd09-10377e243495 button')
    .click();
  await expect(panelEditPage.panel.locator).toContainText('because');
  await expect(panelEditPage.panel.locator).toContainText('a := true');
  await expect(panelEditPage.panel.locator).toContainText('and');
  await expect(panelEditPage.panel.locator).toContainText('b := true');
});

test('should display "No data" in case panel data is empty', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
}) => {
  const dashboard = await readProvisionedDashboard({
    fileName: 'dashboard.json',
  });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '2' });
  await expect(panelEditPage.panel.locator).toContainText('No data');
});

test('should list any fields missing in panel data', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
}) => {
  const dashboard = await readProvisionedDashboard({
    fileName: 'dashboard.json',
  });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '3' });
  await expect(panelEditPage.panel.locator).toContainText(
    'Missing required field(s): id, parent_id, name, value, operator'
  );
});
