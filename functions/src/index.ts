import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import * as crypto from "crypto";
import { defineSecret } from "firebase-functions/params";

admin.initializeApp();
const db = admin.firestore();

// Secret tanımlamaları
const PADDLE_WEBHOOK_SECRET = defineSecret("PADDLE_WEBHOOK_SECRET");
const PADDLE_PRO_PRICE_ID = defineSecret("PADDLE_PRO_PRICE_ID");
const PADDLE_PRO_PLUS_PRICE_ID = defineSecret("PADDLE_PRO_PLUS_PRICE_ID");

/**
 * PADDLE WEBHOOK DOĞRULAMA
 */
const verifyPaddleSignature = (signature: string, body: string, secret: string) => {
  const [timestampStr, hmac] = signature.split(";").map((part) => part.split("=")[1]);
  const signedPayload = `${timestampStr}:${body}`;
  const expectedHmac = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");
  
  return hmac === expectedHmac;
};

// Webhook Handler
export const handlePaddleWebhook = functions.https.onRequest(
  { secrets: [PADDLE_WEBHOOK_SECRET, PADDLE_PRO_PRICE_ID, PADDLE_PRO_PLUS_PRICE_ID] },
  async (req, res) => {
    const signature = req.headers["paddle-signature"] as string;
    const webhookSecret = PADDLE_WEBHOOK_SECRET.value();

    if (!signature || !verifyPaddleSignature(signature, req.rawBody.toString(), webhookSecret)) {
      console.error("Invalid Paddle Signature");
      res.status(401).send("Unauthorized");
      return;
    }

    const event = req.body;
    const eventType = event.event_type;
    const data = event.data;

    try {
      switch (eventType) {
        case "subscription.created":
        case "subscription.updated": {
          const customData = data.custom_data || {};
          const firebaseUID = customData.firebaseUID;
          const status = data.status;
          const priceId = data.items[0].price.id;

          if (firebaseUID) {
            let plan = "starter";
            if (status === "active" || status === "trialing") {
              if (priceId === PADDLE_PRO_PRICE_ID.value()) plan = "pro";
              if (priceId === PADDLE_PRO_PLUS_PRICE_ID.value()) plan = "pro+";
            }
            
            await db.collection("users").doc(firebaseUID).update({
              plan: plan,
              paddleSubscriptionId: data.id,
              paddleCustomerId: data.customer_id
            });
          }
          break;
        }

        case "subscription.canceled": {
          const customData = data.custom_data || {};
          const firebaseUID = customData.firebaseUID;
          if (firebaseUID) {
            await db.collection("users").doc(firebaseUID).update({
              plan: "starter"
            });
          }
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
