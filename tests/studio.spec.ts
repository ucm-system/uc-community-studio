import { test, expect } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { PNG } from "pngjs";
import jsQR from "jsqr";

const artifacts = path.resolve("artifacts");
test.beforeAll(() => mkdir(artifacts, { recursive: true }));

test("all four layouts export exact 4K PNG and preserve the selected community identity", async ({
  page,
}) => {
  test.setTimeout(240_000);
  const errors: string[] = [];
  const embeddedFonts = new Set<string>();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (request.resourceType() === "fetch" && request.url().includes(".woff2"))
      embeddedFonts.add(request.url());
  });
  await page.goto("./");
  await expect(page.getByTestId("activity-card")).toHaveCount(1);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(artifacts, "home-desktop.png") });
  await page
    .getByRole("button", { name: "编辑活动", exact: true })
    .first()
    .click();
  await expect(page.getByTestId("poster")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(artifacts, "studio-desktop.png") });
  for (const kind of ["event", "community"]) {
    await page
      .getByRole("button", {
        name: kind === "event" ? "每期活动" : "社区介绍",
        exact: true,
      })
      .click();
    for (const format of ["portrait", "landscape"]) {
      await page
        .getByRole("button", {
          name: format === "portrait" ? "竖版 3:4" : "横版 16:9",
          exact: true,
        })
        .click();
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator(".overflow-notice")).toHaveCount(0);
      const downloadPromise = page.waitForEvent("download", {
        timeout: 120_000,
      });
      await page
        .getByRole("button", { name: "导出 4K PNG", exact: true })
        .click();
      const download = await downloadPromise;
      const file = path.join(artifacts, `${kind}-${format}-4K.png`);
      await download.saveAs(file);
      const bytes = await readFile(file);
      expect(bytes.subarray(1, 4).toString()).toBe("PNG");
      expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)]).toEqual(
        format === "portrait" ? [2880, 3840] : [3840, 2160],
      );
      await expect(
        page.getByRole("button", { name: "导出 4K PNG", exact: true }),
      ).toBeEnabled();
    }
  }
  const declaredFaces = await page.evaluate(
    () => Array.from(document.fonts).length,
  );
  expect(embeddedFonts.size).toBeGreaterThan(0);
  expect(embeddedFonts.size).toBeLessThan(declaredFaces);
  expect(errors).toEqual([]);
});

test("edit, duplicate, reload and backup/import preserve content with uploaded images", async ({
  page,
}) => {
  await page.goto("./");
  await page
    .getByRole("button", { name: "编辑活动", exact: true })
    .first()
    .click();
  await page
    .getByLabel("分享标题", { exact: true })
    .fill("从 Scheduler 到 Worker\n理解 KV Cache 的生命周期");
  await page.getByLabel("主讲人姓名", { exact: true }).fill("示例主讲人");
  await page
    .getByLabel("上传主讲人头像", { exact: true })
    .setInputFiles("public/assets/ucm-symbol.png");
  await page
    .getByLabel("上传参与二维码", { exact: true })
    .setInputFiles("tests/fixtures/qr.png");
  await expect(page.locator(".speaker-avatar")).toBeVisible();
  await expect(page.locator(".qr-block img")).toBeVisible();
  await expect(page.locator(".save-state")).toHaveText("已保存到本地");
  await page.reload();
  await expect(page.getByLabel("分享标题", { exact: true })).toHaveValue(
    "从 Scheduler 到 Worker\n理解 KV Cache 的生命周期",
  );
  await expect(page.locator(".speaker-avatar")).toBeVisible();
  await expect(page.locator(".qr-block img")).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出草稿", exact: true }).click();
  const backup = await downloadPromise;
  const file = path.join(artifacts, "roundtrip.ucposter.json");
  await backup.saveAs(file);
  const content = JSON.parse(await readFile(file, "utf8"));
  expect(content.draft.event.avatar).toMatch(/^data:image\/png;base64,/);
  expect(content.draft.event.qr).toMatch(/^data:image\/png;base64,/);
  await page.getByLabel("导入草稿文件").setInputFiles(file);
  await expect(page.getByLabel("草稿名称", { exact: true })).toHaveValue(
    /（导入）/,
  );
  await expect(page.locator(".qr-block img")).toBeVisible();
  await page.getByRole("button", { name: "活动首页", exact: true }).click();
  await page
    .getByRole("button", {
      name: "复制 第 001 期 · KV Cache（示例）",
      exact: true,
    })
    .click();
  await expect(page.getByLabel("草稿名称", { exact: true })).toHaveValue(
    /副本/,
  );
  await page.getByLabel("分享标题", { exact: true }).fill("副本独立编辑");
  await page.getByRole("button", { name: "活动首页", exact: true }).click();
  await page
    .getByTestId("activity-card")
    .filter({ hasText: "第 001 期 · KV Cache（示例）" })
    .filter({ hasNotText: /副本|导入/ })
    .getByRole("button", { name: "编辑活动", exact: true })
    .click();
  await expect(page.getByLabel("分享标题", { exact: true })).toHaveValue(
    /从 Scheduler/,
  );
  await page
    .getByLabel("分享标题", { exact: true })
    .fill("KV Cache 的复用与传输");
  await expect(page.locator(".preview-live")).toHaveText("实时预览", {
    timeout: 30_000,
  });
  await expect(page.locator(".overflow-notice")).toHaveCount(0);
  const imagePromise = page.waitForEvent("download", { timeout: 120_000 });
  await page.getByRole("button", { name: "导出 4K PNG", exact: true }).click();
  await (
    await imagePromise
  ).saveAs(path.join(artifacts, "event-with-qr-4K.png"));
  const png = PNG.sync.read(
    await readFile(path.join(artifacts, "event-with-qr-4K.png")),
  );
  const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  expect(decoded?.data).toBe("https://example.com/uc-community-test");
  await page.getByRole("button", { name: "移除主讲人头像" }).click();
  await page.getByRole("button", { name: "移除参与二维码" }).click();
  await expect(page.locator(".speaker-avatar")).toHaveCount(0);
  await expect(page.locator(".qr-block")).toHaveCount(0);
});

test("overflow is actionable and narrow screens keep editing and export available", async ({
  page,
}) => {
  await page.goto("./");
  await page
    .getByRole("button", { name: "编辑活动", exact: true })
    .first()
    .click();
  await page
    .getByLabel("分享标题", { exact: true })
    .fill("这是一段超过合理排版空间的分享标题".repeat(12));
  await expect(page.locator(".preview-live")).toHaveText("实时预览", {
    timeout: 30_000,
  });
  await expect(page.locator(".overflow-notice")).toContainText("分享标题");
  await expect(
    page.getByRole("button", { name: "导出 4K PNG", exact: true }),
  ).toBeDisabled();
  await page
    .getByLabel("分享标题", { exact: true })
    .fill("一条请求\n一个好问题");
  await expect(page.locator(".preview-live")).toHaveText("实时预览", {
    timeout: 30_000,
  });
  await expect(page.locator(".overflow-notice")).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("button", { name: "导出 4K PNG", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: path.join(artifacts, "studio-mobile.png"),
    fullPage: true,
  });
});
