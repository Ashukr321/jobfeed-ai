import { chromium, type BrowserContext } from "playwright";
import { settings } from "../config/settings.ts";

/**
 * Opens Playwright's Chromium on a dedicated, persistent profile (never your everyday browser profile),
 * so portal logins and cookies survive between runs. The profile folder holds session state: keep it private.
 */
export function openBrowser(headless = false, profileDir = settings.browserProfileDir): Promise<BrowserContext> {
  return chromium.launchPersistentContext(profileDir, { headless, viewport: null });
}
