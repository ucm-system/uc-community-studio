import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

test("home lists activities, new opens editor, hash navigation survives reload, and empty stays empty", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("./");
  await expect(page.getByRole("heading", { name: /每期活动/ })).toBeVisible();
  await page.getByRole("button", { name: "新建活动", exact: true }).click();
  await expect(page.getByLabel("分享标题", { exact: true })).toHaveValue(
    "从一条请求出发\n理解 KV Cache",
  );
  await page
    .getByLabel("草稿名称", { exact: true })
    .fill("第 002 期 · 请求调度");
  await page.getByLabel("分享标题", { exact: true }).fill("跟着请求理解调度");
  await page.getByLabel("主讲人姓名", { exact: true }).fill("示例讲师");
  await page.getByLabel("日期", { exact: true }).fill("2026-09-24");
  await expect(page.locator(".save-state")).toHaveText("已保存到本地");
  const editUrl = page.url();
  expect(editUrl).toContain("#/edit/");
  await page.getByRole("button", { name: "活动首页", exact: true }).click();
  await expect(page.getByTestId("activity-card")).toHaveCount(2);
  const card = page
    .getByTestId("activity-card")
    .filter({ hasText: "第 002 期 · 请求调度" });
  await expect(card).toContainText("跟着请求理解调度");
  await expect(card).toContainText("示例讲师");
  await page.reload();
  await expect(page.getByTestId("activity-card")).toHaveCount(2);
  await card.getByRole("button", { name: "编辑活动", exact: true }).click();
  await page.goBack();
  await expect(page.getByRole("heading", { name: /每期活动/ })).toBeVisible();
  await page.goto(editUrl);
  await page.reload();
  await expect(page.getByLabel("分享标题", { exact: true })).toHaveValue(
    "跟着请求理解调度",
  );
  await page.getByRole("button", { name: "活动首页", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("button", { name: "新建活动", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await mkdir("artifacts", { recursive: true });
  await page.screenshot({ path: "artifacts/home-mobile.png", fullPage: true });
  // These are isolated test records, not the user's browser data.
  page.on("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "删除 第 002 期 · 请求调度", exact: true })
    .click();
  await expect(page.getByTestId("activity-card")).toHaveCount(1);
  await page
    .getByRole("button", {
      name: "删除 第 001 期 · KV Cache（示例）",
      exact: true,
    })
    .click();
  await expect(page.getByTestId("activity-card")).toHaveCount(0);
  await page.reload();
  await expect(page.getByText("下一次分享，从这里开始。")).toBeVisible();
  expect(errors).toEqual([]);
});
