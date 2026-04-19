import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as crypto from "crypto";
import { defineSecret } from "firebase-functions/params";

// Secret tanımlamaları
const LEMON_SQUEEZY_WEBHOOK_SECRET = defineSecret("LEMON_SQUEEZY_WEBHOOK_SECRET");
const LEMON_SQUEEZY_PRO_VARIANT_ID = defineSecret("LEMON_SQUEEZY_PRO_VARIANT_ID");
const LEMON_SQUEEZY_PRO_PLUS_VARIANT_ID = defineSecret("LEMON_SQUEEZY_PRO_PLUS_VARIANT_ID");

/**
 * LEMON SQUEEZY WEBHOOK DOĞRULAMA
 */
const verifyLemonSqueezySignature = (signature: string, rawBody: Buffer, secret: string) => {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch (e) {
    return false;
  }
};

// Webhook Handler
export const handleLemonSqueezyWebhook = onRequest(
  { 
    secrets: [
      LEMON_SQUEEZY_WEBHOOK_SECRET, 
      LEMON_SQUEEZY_PRO_VARIANT_ID, 
      LEMON_SQUEEZY_PRO_PLUS_VARIANT_ID
    ] 
  },
  async (req, res) => {
    // Admin yetkisini fonksiyonun içinde başlatalım (Keşif hızını artırmak için)
    if (admin.apps.length === 0) {
      admin.initializeApp();
    }
    const db = admin.firestore();

    const signature = req.headers["x-signature"] as string;
    const webhookSecret = LEMON_SQUEEZY_WEBHOOK_SECRET.value();

    console.log("Full Webhook Body:", JSON.stringify(req.body));

    if (!signature || !verifyLemonSqueezySignature(signature, (req as any).rawBody, webhookSecret)) {
      console.error("Signature mismatch!");
      res.status(401).send("Unauthorized");
      return;
    }

    const event = req.body;
    const eventName = event.meta ? event.meta.event_name : "unknown";
    const data = event.data;

    try {
      const customData = event.meta?.custom_data || {};
      const firebaseUID = customData.user_id || customData.firebaseUID;

      console.log(`Processing Event: ${eventName} for UID: ${firebaseUID}`);

      if (!firebaseUID) {
        console.warn("CRITICAL: No firebaseUID/user_id found in metadata!");
        res.json({ received: true, message: "No UID" });
        return;
      }

      switch (eventName) {
        case "subscription_created":
        case "subscription_updated": {
          const status = data.attributes.status;
          const variantId = data.attributes.variant_id.toString();

          let plan = "starter";
          if (status === "active" || status === "on_trial") {
            if (variantId === LEMON_SQUEEZY_PRO_VARIANT_ID.value()) plan = "pro";
            if (variantId === LEMON_SQUEEZY_PRO_PLUS_VARIANT_ID.value()) plan = "pro+";
          }

          console.log(`Updating user ${firebaseUID} to plan: ${plan}`);
          await db.collection("users").doc(firebaseUID).update({
            plan: plan,
            lemonSqueezySubscriptionId: data.id,
            lemonSqueezyCustomerId: data.attributes.customer_id
          });
          break;
        }

        case "subscription_cancelled":
        case "subscription_expired": {
          await db.collection("users").doc(firebaseUID).update({
            plan: "starter"
          });
          break;
        }
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.error("Error processing LS webhook:", error);
      res.status(500).send("Error");
    }
  }
);
