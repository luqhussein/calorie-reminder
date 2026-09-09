import { getStore } from "@netlify/blobs";
import { configureWebPush } from "./_push-common.mjs";
export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  try {
    const { deviceId } = await req.json();
    const store = getStore({ name: "push-schedules", consistency: "strong" });
    const record = await store.get(deviceId, { type: "json", consistency: "strong" });
    if (!record) return Response.json({ error: "Device subscription not found" }, { status: 404 });
    const wp = configureWebPush();
    await wp.sendNotification(record.subscription, JSON.stringify({
      title: "✅ Calorie Reminder test",
      body: "Background push is working on this phone.",
      tag: "calorie-reminder-test",
      url: "/"
    }));
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
};
