import { test, expect } from "@playwright/test"

test("home navigation", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByText("Backgammon Move Suggester")).toBeVisible()
  await page.getByRole("button", { name: "Set up manually" }).click()
  await expect(page.getByText("Board Setup")).toBeVisible()
})
