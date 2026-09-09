import { getStore } from "@netlify/blobs";
import { configureWebPush, payloadFor } from "./_push-common.mjs";

function localParts(now, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone, year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", hourCycle:"h23"
  }).formatToParts(now);
  const o = Object.fromEntries(parts.filter(p=>p.type!=="literal").map(p=>[p.type,p.value]));
  return { date:`${o.year}-${o.month}-${o.day}`, time:`${o.hour}:${o.minute}` };
}

export default async () => {
  const store = getStore({ name: "push-schedules", consistency: "strong" });
  const wp = configureWebPush();
  const { blobs } = await store.list();

  for (const blob of blobs) {
    const record = await store.get(blob.key, { type:"json", consistency:"strong" });
    if (!record?.subscription || !record?.schedule?.meals || !record?.timezone) continue;

    const { date, time } = localParts(new Date(), record.timezone);
    let changed = false;
    let deleted = false;

    for (const meal of record.schedule.meals) {
      if (meal.time !== time) continue;

      const sentKey = `${date}|${time}`;
      if (record.lastSent?.[meal.name] === sentKey) continue;

      try {
        await wp.sendNotification(record.subscription, payloadFor(meal));
        record.lastSent = record.lastSent || {};
        record.lastSent[meal.name] = sentKey;
        changed = true;
      } catch (e) {
        console.error("Push failed", blob.key, e.statusCode || "", e.message);
        if (e.statusCode === 404 || e.statusCode === 410) {
          await store.delete(blob.key);
          deleted = true;
          break;
        }
      }
    }

    if (changed && !deleted) {
      record.updatedAt = new Date().toISOString();
      await store.setJSON(blob.key, record);
    }
  }
};
