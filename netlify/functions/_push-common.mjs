import webpush from "web-push";
export function configureWebPush() {
  const subject = process.env.VAPID_SUBJECT;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!subject || !publicKey || !privateKey) throw new Error("Missing VAPID_SUBJECT / VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY");
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return webpush;
}
export function payloadFor(meal) {
  return JSON.stringify({
    title: `🍽️ ${meal.name} reminder`,
    body: `Target: about ${meal.calories} kcal. ${meal.food || ""}`.trim(),
    tag: `meal-${meal.name}`,
    url: "/"
  });
}
