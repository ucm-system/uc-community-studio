import { test, expect } from "@playwright/test";

test("guest brief copies both blank fields and example, and new activities start from sample values", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("./");
  await page.getByRole("button", { name: "嘉宾填写模板", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "给嘉宾的填写模板" });
  const content = await dialog.getByLabel("嘉宾填写内容").inputValue();
  expect(content).toContain("【待填写】");
  expect(content).toContain("分享主题：\n副标题（可选）：");
  expect(content).toContain("【填写示例");
  expect(content).toContain("主讲人姓名：李明（示例）");
  expect(content).toContain("分享主题：从一条请求出发，理解 KV Cache");
  await dialog
    .getByRole("button", { name: "复制模板与示例", exact: true })
    .click();
  await expect(dialog.getByRole("status")).toContainText("已复制模板与示例");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    content,
  );
  await dialog.getByRole("button", { name: "关闭嘉宾填写模板" }).click();
  await page.getByRole("button", { name: "新建活动", exact: true }).click();
  await expect(page.getByLabel("分享标题", { exact: true })).toHaveValue(
    "从一条请求出发\n理解 KV Cache",
  );
  await expect(page.getByLabel("主讲人姓名", { exact: true })).toHaveValue(
    "李明（示例）",
  );
  await expect(page.getByLabel("日期", { exact: true })).toHaveValue(
    "2026-09-17",
  );
  await expect(page.getByLabel("开始时间", { exact: true })).toHaveValue(
    "19:00",
  );
  await expect(page.getByLabel("标记为示例活动")).toBeChecked();
  await page.getByLabel("分享标题", { exact: true }).fill("实际活动主题");
  await page.getByRole("button", { name: "嘉宾填写模板", exact: true }).click();
  await expect(dialog.getByLabel("嘉宾填写内容")).toHaveValue(content);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    dialog.getByRole("button", { name: "复制模板与示例", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await dialog.getByRole("button", { name: "关闭嘉宾填写模板" }).click();
  await expect(page.getByLabel("分享标题", { exact: true })).toHaveValue(
    "实际活动主题",
  );
});
