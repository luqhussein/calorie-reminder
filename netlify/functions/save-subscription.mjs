import { getStore } from "@netlify/blobs";
export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  try {
    const body = await req.json();
    const { deviceId, subscription, schedule, timezone } = body;
    if (!deviceId || !subscription?.endpoint || !schedule?.meals?.length || !timezone) {
      return Response.json({ error: "Missing deviceId, subscription, schedule or timezone" }, { status: 400 });
    }
    const store = getStore({ name: "push-schedules", consistency: "strong" });
    const existing = await store.get(deviceId, { type: "json", consistency: "strong" });
    await store.setJSON(deviceId, {
      deviceId,
      subscription,
      schedule,
      timezone,
      lastSent: existing?.lastSent || {},
      updatedAt: new Date().toISOString()
    });
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
};
