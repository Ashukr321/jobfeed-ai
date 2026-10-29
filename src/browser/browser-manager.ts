import { chromium, type BrowserContext } from "playwright";
import { settings } from "../config/settings.ts";

/**
 * Opens your installed Google Chrome on a dedicated, persistent profile so portal logins and cookies
 * survive between runs. It can't be your everyday Chrome profile: Chrome blocks automation on that one.
 * The profile folder holds session state: keep it private.
 */
export function openBrowser(headless = false, profileDir = settings.browserProfileDir): Promise<BrowserContext> {
  return chromium.launchPersistentContext(profileDir, { channel: "chrome", headless, viewport: null });
}
