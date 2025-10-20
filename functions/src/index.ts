import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import fetch from "cross-fetch";
import { v4 as uuidv4 } from "uuid";

admin.initializeApp();
const db = admin.firestore();

const stripeSecretKey = process.env.STRIPE_SK;
if (!stripeSecretKey) {
  throw new Error("STRIPE_SK environment variable is required");
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-06-20",
});

interface CheckoutItem {
  releaseId: string;
  sku: string;
  qty: number;
  stripePriceId: string;
  unitPrice: number;
  title: string;
}

interface CheckoutSessionData {
  items: CheckoutItem[];
  currency?: string;
  successUrl: string;
  cancelUrl: string;
}

export const createCheckoutSession = functions.https.onCall(
  async (data: CheckoutSessionData, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Login required"
      );
    }

    const { items, currency = "CHF", successUrl, cancelUrl } = data;

    if (!items || items.length === 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Items are required"
      );
    }

    const lineItems = items.map((item) => ({
      price: item.stripePriceId,
      quantity: item.qty,
    }));

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: lineItems,
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: context.auth.token.email,
        metadata: {
          uid: context.auth.uid,
          items: JSON.stringify(
            items.map((it) => ({
              releaseId: it.releaseId,
              sku: it.sku,
              qty: it.qty,
              unitPrice: it.unitPrice,
              title: it.title,
            }))
          ),
        },
        currency: currency.toLowerCase(),
      });

      return { id: session.id, url: session.url };
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      throw new functions.https.HttpsError(
        "internal",
        `Failed to create checkout session: ${error.message}`
      );
    }
  }
);

export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;

  if (!sig) {
    console.error("No stripe-signature header");
    return res.status(400).send("Missing stripe-signature header");
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return res.status(500).send("Webhook secret not configured");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      webhookSecret
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`Received event: ${event.type}`);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const uid = session.metadata?.uid;
    const itemsJson = session.metadata?.items;

    if (!uid || !itemsJson) {
      console.error("Missing uid or items in session metadata");
      return res.status(400).send("Invalid session metadata");
    }

    try {
      const items = JSON.parse(itemsJson);
      const orderId = uuidv4();

      const subtotal = items.reduce(
        (sum: number, item: any) => sum + item.unitPrice * item.qty,
        0
      );

      const orderData = {
        userRef: db.collection("users").doc(uid),
        items: items.map((item: any) => ({
          releaseRef: db.collection("releases").doc(item.releaseId),
          sku: item.sku,
          qty: item.qty,
          unitPrice: item.unitPrice,
          title: item.title,
          subtotal: item.unitPrice * item.qty,
        })),
        totals: {
          subtotal,
          shipping: 0,
          tax: 0,
          grandTotal: subtotal,
          currency: session.currency?.toUpperCase() || "CHF",
        },
        shipping: {
          name: session.customer_details?.name || "",
          email: session.customer_details?.email || "",
        },
        payment: {
          provider: "stripe",
          status: "paid",
          intentId: session.payment_intent as string,
          sessionId: session.id,
        },
        status: "paid",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await db.collection("orders").doc(orderId).set(orderData);

      for (const item of items) {
        const releaseRef = db.collection("releases").doc(item.releaseId);
        const releaseDoc = await releaseRef.get();

        if (releaseDoc.exists) {
          const release = releaseDoc.data();
          const formats = release?.formats || [];
          const formatIndex = formats.findIndex(
            (f: any) => f.sku === item.sku
          );

          if (formatIndex !== -1 && formats[formatIndex].stock >= item.qty) {
            formats[formatIndex].stock -= item.qty;
            await releaseRef.update({ formats });
          }
        }
      }

      const cartRef = db.collection("carts").doc(uid);
      await cartRef.delete();

      console.log(`Order ${orderId} created successfully for user ${uid}`);
    } catch (error: any) {
      console.error("Error processing checkout session:", error);
      return res.status(500).send(`Error: ${error.message}`);
    }
  }

  res.json({ received: true });
});

interface EnrichReleaseData {
  releaseId: string;
  artist?: string;
  title?: string;
  barcode?: string;
  catno?: string;
}

export const enrichRelease = functions.https.onCall(
  async (data: EnrichReleaseData, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Login required"
      );
    }

    const { releaseId, artist, title, barcode, catno } = data;

    if (!releaseId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "releaseId is required"
      );
    }

    try {
      let mbUrl: string;

      if (barcode) {
        mbUrl = `https://musicbrainz.org/ws/2/release/?query=barcode:${barcode}&fmt=json`;
      } else if (artist && title) {
        mbUrl = `https://musicbrainz.org/ws/2/release/?query=artist:${encodeURIComponent(
          artist
        )}%20AND%20release:${encodeURIComponent(title)}&fmt=json`;
      } else {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Either barcode or both artist and title are required"
        );
      }

      const response = await fetch(mbUrl, {
        headers: {
          "User-Agent": "FromDeepestRecord/1.0 (contact@fromdeepestrecord.com)",
        },
      });

      if (!response.ok) {
        throw new Error(`MusicBrainz API error: ${response.statusText}`);
      }

      const json = await response.json();

      if (!json.releases || json.releases.length === 0) {
        throw new functions.https.HttpsError(
          "not-found",
          "No release found in MusicBrainz"
        );
      }

      const release = json.releases[0];
      const mbid = release.id;

      let coverUrl = "";
      try {
        const coverResponse = await fetch(
          `https://coverartarchive.org/release/${mbid}`,
          {
            headers: {
              "User-Agent":
                "FromDeepestRecord/1.0 (contact@fromdeepestrecord.com)",
            },
          }
        );

        if (coverResponse.ok) {
          const coverJson = await coverResponse.json();
          if (coverJson.images && coverJson.images.length > 0) {
            coverUrl = coverJson.images[0].thumbnails?.large || coverJson.images[0].image;
          }
        }
      } catch (coverError) {
        console.log("Cover art not found, continuing...");
      }

      const updateData: any = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (coverUrl) {
        updateData.cover = coverUrl;
      }

      if (release.country) {
        updateData.country = release.country;
      }

      if (release.date) {
        updateData.releaseDate = admin.firestore.Timestamp.fromDate(
          new Date(release.date)
        );
      }

      await db
        .collection("releases")
        .doc(releaseId)
        .set(updateData, { merge: true });

      return {
        ok: true,
        mbid,
        coverUrl: coverUrl || null,
        country: release.country || null,
        date: release.date || null,
      };
    } catch (error: any) {
      console.error("Error enriching release:", error);
      throw new functions.https.HttpsError(
        "internal",
        `Failed to enrich release: ${error.message}`
      );
    }
  }
);

export * from "./admin";
