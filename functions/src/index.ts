import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import * as crypto from "crypto";
import { defineSecret } from "firebase-functions/params";

admin.initializeApp();
const db = admin.firestore();

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
export const handleLemonSqueezyWebhook = functions.https.onRequest(
  { 
    secrets: [
      LEMON_SQUEEZY_WEBHOOK_SECRET, 
      LEMON_SQUEEZY_PRO_VARIANT_ID, 
      LEMON_SQUEEZY_PRO_PLUS_VARIANT_ID
    ] 
  },
  async (req, res) => {
    const signature = req.headers["x-signature"] as string;
    const webhookSecret = LEMON_SQUEEZY_WEBHOOK_SECRET.value();

    if (!signature || !verifyLemonSqueezySignature(signature, (req as any).rawBody, webhookSecret)) {
      console.error("Invalid Lemon Squeezy Signature");
      res.status(401).send("Unauthorized");
      return;
    }

    const event = req.body;
    const eventName = event.meta.event_name;
    const data = event.data;

    try {
      const customData = event.meta.custom_data || {};
      const firebaseUID = customData.firebaseUID;

      if (!firebaseUID) {
        console.warn("No firebaseUID found in webhook metadata");
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
            // Secret .value() metodu ile okunur
            if (variantId === LEMON_SQUEEZY_PRO_VARIANT_ID.value()) plan = "pro";
            if (variantId === LEMON_SQUEEZY_PRO_PLUS_VARIANT_ID.value()) plan = "pro+";
          }

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

      res.json({ received: true });
    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);
