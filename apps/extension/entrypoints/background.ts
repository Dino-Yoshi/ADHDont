import { ALARM_NAMES, finishLockdown, syncLockdown } from "@/src/enforcement";

export default defineBackground(() => {
  // Chromium alarms fire at most once a minute, so poll on the same cadence.
  browser.alarms.create(ALARM_NAMES.POLL_LOCKDOWN, { periodInMinutes: 1 });

  browser.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === ALARM_NAMES.POLL_LOCKDOWN) {
      await syncLockdown();
    } else if (alarm.name === ALARM_NAMES.LOCKDOWN_END) {
      await finishLockdown();
    }
  });

  browser.runtime.onStartup.addListener(async () => {
    browser.alarms.create(ALARM_NAMES.POLL_LOCKDOWN, { periodInMinutes: 1 });
    await syncLockdown();
  });

  // Run initial sync on worker startup.
  void syncLockdown();
});
