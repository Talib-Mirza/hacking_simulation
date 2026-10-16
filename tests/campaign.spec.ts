import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { missions } from "../src/content";

async function useMissionTool(page: Page, id: number) {
  const mission = missions[id];
  const workspace = page.locator(".lab-workspace");
  if (mission.tool === "terminal") {
    await workspace
      .getByRole("textbox", { name: "Terminal command" })
      .fill(
        (
          {
            0: "cat ./scope.txt",
            1: "ls -al",
            2: "nslookup relay.meridian.test",
            3: "nmap relay.meridian.test",
            14: "sha256sum ./update.bin",
          } as Record<number, string>
        )[id] || mission.command,
      );
    await workspace
      .getByRole("textbox", { name: "Terminal command" })
      .press("Enter");
    await expect(workspace.getByRole("log")).toContainText(
      (
        {
          0: "cat ./scope.txt",
          1: "ls -al",
          2: "nslookup relay.meridian.test",
          3: "nmap relay.meridian.test",
          14: "sha256sum ./update.bin",
        } as Record<number, string>
      )[id] || mission.command,
    );
    return;
  }
  switch (id) {
    case 4:
      await workspace
        .getByRole("textbox", { name: "Exposure search" })
        .fill("relay.meridian.test");
      await workspace
        .getByRole("button", { name: "Search", exact: true })
        .click();
      await workspace
        .getByRole("button", {
          name: /relay.meridian.test.*Meridian Infrastructure/,
        })
        .click();
      await expect(workspace).toContainText("Anonymous login: allowed");
      break;
    case 5:
      await workspace
        .getByRole("textbox", { name: "Simulated browser address" })
        .fill("https://relay.meridian.test/robots.txt");
      await workspace
        .getByRole("button", { name: "Navigate", exact: true })
        .click();
      await expect(workspace).toContainText("Disallow: /continuity-archive/");
      await workspace
        .getByRole("button", { name: "Open /continuity-archive/" })
        .click();
      await expect(workspace).toContainText(
        "We kept the lights on. You erased our names.",
      );
      break;
    case 7:
      await workspace
        .getByRole("textbox", { name: "Traffic display filter" })
        .fill("http");
      await workspace.getByRole("button", { name: "Apply" }).click();
      await workspace.locator("tbody tr").first().click();
      await expect(workspace).toContainText("X-Meridian-Operator: M-07");
      break;
    case 8:
      await workspace
        .getByRole("button", { name: "Inspect session cookie" })
        .click();
      await expect(workspace).toContainText("HttpOnly: absent");
      break;
    case 9:
      await expect(workspace).toContainText("Invoice #1042");
      await workspace
        .getByRole("button", { name: "Invoice #1043 · partner" })
        .click();
      await expect(workspace).toContainText("CHOIR-REHEARSAL");
      break;
    case 10:
      await workspace
        .getByRole("textbox", { name: "Archive search" })
        .fill("'");
      await workspace
        .getByRole("button", { name: "Search", exact: true })
        .click();
      await expect(workspace).toContainText("500 · Query parse error");
      await expect(workspace).toContainText("bound value:");
      break;
    case 11:
      await workspace
        .getByRole("button", {
          name: /Remove temporary deployment credentials/,
        })
        .click();
      await expect(workspace).toContainText(
        "RELAY_TOKEN=demo_expired_M07_readonly",
      );
      break;
    case 12:
      await workspace
        .getByRole("textbox", { name: "Search CVE database" })
        .fill("CVE-2021-41773");
      await workspace
        .getByRole("button", { name: "Search", exact: true })
        .click();
      await expect(workspace).toContainText("Apache HTTP Server 2.4.49");
      await workspace
        .getByRole("button", { name: "Compare with captured service evidence" })
        .click();
      break;
    case 13:
      await workspace
        .getByRole("button", { name: "Inspect update download" })
        .click();
      await expect(workspace).toContainText("The link was not opened.");
      await workspace
        .getByRole("button", { name: "Examine original headers" })
        .click();
      await expect(workspace).toContainText("dmarc=fail");
      break;
    case 16:
      await workspace
        .getByRole("textbox", { name: "Traffic display filter" })
        .fill("failed_login");
      await workspace.getByRole("button", { name: "Apply" }).click();
      await workspace.locator("tbody tr").first().click();
      await expect(page.locator(".handler-review")).toHaveCount(0);
      await workspace
        .getByRole("button", {
          name: "Follow source session beyond failed events",
        })
        .click();
      await expect(workspace).toContainText("LOGIN SUCCESS  user=M-07");
      break;
    case 18:
      await workspace
        .getByRole("combobox", {
          name: "Priority for Stale identity and broken access boundaries",
        })
        .selectOption("Low");
      await workspace
        .getByRole("combobox", { name: "Priority for Anonymous archival FTP" })
        .selectOption("Medium");
      await workspace
        .getByRole("combobox", {
          name: "Priority for Apache CVE inferred from banner",
        })
        .selectOption("High");
      await workspace
        .getByRole("button", { name: "Save risk-based priorities" })
        .click();
      await expect(page.locator(".handler-review")).toHaveCount(0);
      await expect(workspace).toContainText("Reconsider impact");
      await workspace
        .getByRole("combobox", {
          name: "Priority for Stale identity and broken access boundaries",
        })
        .selectOption("High");
      await workspace
        .getByRole("combobox", {
          name: "Priority for Apache CVE inferred from banner",
        })
        .selectOption("Low");
      await workspace
        .getByRole("button", { name: "Save risk-based priorities" })
        .click();
      break;
    case 19:
      await expect(workspace).toContainText("the human actor is unconfirmed");
      await workspace
        .getByRole("checkbox", { name: "Scope and limitations documented" })
        .check();
      await workspace
        .getByRole("checkbox", { name: "Reproduction evidence sanitized" })
        .check();
      await expect(
        workspace.getByRole("button", { name: "File assessment with Mira" }),
      ).toHaveCount(0);
      await workspace
        .getByRole("checkbox", {
          name: "Remediation and verification included",
        })
        .check();
      await workspace
        .getByRole("button", { name: "File assessment with Mira" })
        .click();
      break;
    default:
      throw new Error(`No UI workflow for mission ${id}`);
  }
}

test("the complete 20-operation campaign responds to observations, unlocks, and persists progress", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /The quiet before the breach/ }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "Unlocked tools" })
      .getByRole("button"),
  ).toHaveCount(1);
  await page.getByRole("button", { name: "The campaign", exact: true }).click();
  await expect(page.locator(".campaign-row").nth(1)).toBeDisabled();
  await expect(page.locator(".campaign-row").nth(19)).toBeDisabled();
  await page.locator(".campaign-row").first().click();

  for (const mission of missions) {
    await test.step(`Operation ${mission.id + 1}: ${mission.title}`, async () => {
      await expect(
        page.getByRole("heading", {
          level: 1,
          name: `${mission.title}.`,
          exact: true,
        }),
      ).toBeVisible();
      await expect(page.locator(".story-intro")).toContainText(mission.intro);
      await page.getByRole("button", { name: "Enter the field" }).click();
      await expect(page.locator(".handler-review")).toHaveCount(0);

      if (mission.id === 0) {
        const terminal = page.getByRole("textbox", {
          name: "Terminal command",
        });
        await terminal.fill("curl https://example.com");
        await terminal.press("Enter");
        await expect(page.getByRole("log")).toContainText("SCOPE GUARD");
        await expect(page.locator(".handler-review")).toHaveCount(0);
      }
      await useMissionTool(page, mission.id);
      await expect(
        page.getByText("Observation captured", { exact: true }),
      ).toBeVisible();
      if ([0, 6, 9, 11, 13, 16, 17].includes(mission.id)) {
        const decisions = page
          .locator(".handler-decisions")
          .getByRole("button");
        await expect(decisions).toHaveCount(3);
        if (mission.id === 0) {
          await decisions.nth((mission.answer + 1) % 3).click();
          await expect(page.locator(".debrief-card")).toHaveCount(0);
          await expect(
            page.getByText("Mira · Let’s think that through."),
          ).toBeVisible();
          const completed = await page.evaluate(
            () =>
              JSON.parse(localStorage.getItem("signal-zero-v1") || "{}")
                .completed,
          );
          expect(completed).toEqual([]);
        }
        await decisions.nth(mission.answer).click();
        await expect(page.getByText("Mira · That’s the call.")).toBeVisible();
        await expect(page.locator(".debrief-evidence")).toContainText(
          mission.evidence,
        );
        await expect(page.locator(".debrief-card blockquote")).toContainText(
          mission.reveal,
        );
        await page.getByRole("button", { name: "Next operation" }).click();
      } else {
        await expect(page.locator(".handler-review.ready")).toBeVisible();
        await expect(page.locator(".mentor-annotation")).toContainText(
          mission.explanation,
        );
        await expect(page.locator(".live-story-reveal")).toContainText(
          mission.reveal,
        );
        await expect(page.locator(".handler-decisions")).toHaveCount(0);
        await expect
          .poll(async () =>
            page.evaluate(
              () =>
                JSON.parse(localStorage.getItem("signal-zero-v1") || "{}")
                  .completed.length,
            ),
          )
          .toBe(mission.id + 1);
        if (mission.id === 3) {
          await page.reload();
          await expect(page.locator(".progress-content")).toContainText("4");
          await page
            .getByRole("button", { name: "The campaign", exact: true })
            .click();
          await expect(page.locator(".campaign-row").nth(4)).toBeEnabled();
          await expect(page.locator(".campaign-row").nth(5)).toBeDisabled();
          await page.locator(".campaign-row").nth(4).click();
        } else if (mission.id === 19) {
          await page
            .getByRole("button", { name: "Read the last transmission" })
            .click();
          await expect(page.locator(".debrief-card blockquote")).toContainText(
            mission.reveal,
          );
        } else {
          await page
            .getByRole("button", { name: "Follow the lead", exact: true })
            .click();
        }
      }
    });
  }

  await page
    .getByRole("button", { name: "Return to command", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "You kept the light on." }),
  ).toBeVisible();
  await expect(page.locator(".progress-ring")).toContainText("100%");
  await expect(
    page
      .getByRole("navigation", { name: "Unlocked tools" })
      .getByRole("button"),
  ).toHaveCount(8);
  await page.reload();
  await expect(page.locator(".progress-ring")).toContainText("100%");
  await page.getByRole("button", { name: "Open your case file" }).click();
  await expect(page.locator(".evidence-timeline article")).toHaveCount(20);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export case file" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("meridian-case-file.txt");
  const report = await readFile((await download.path())!, "utf8");
  expect(report).toContain("Completed missions: 20/20");
  expect(report).toContain(missions[19].evidence);
  expect(errors).toEqual([]);
});
