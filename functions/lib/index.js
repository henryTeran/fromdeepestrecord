"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrichRelease = exports.stripeWebhook = exports.createCheckoutSession = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const stripe_1 = __importDefault(require("stripe"));
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const uuid_1 = require("uuid");
admin.initializeApp();
const db = admin.firestore();
if (process.env.FUNCTIONS_EMULATOR === "true") {
    // charge le .env en local quand tu utilises l’émulateur
    require("dotenv").config();
}
const stripeSecretKey = process.env.STRIPE_SK;
if (!stripeSecretKey) {
    throw new Error("STRIPE_SK environment variable is required");
}
const stripe = new stripe_1.default(stripeSecretKey, {
    apiVersion: "2023-10-16",
});
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Login required");
    }
    const { items, currency = "CHF", successUrl, cancelUrl } = data;
    if (!items || items.length === 0) {
        throw new functions.https.HttpsError("invalid-argument", "Items are required");
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
                items: JSON.stringify(items.map((it) => ({
                    releaseId: it.releaseId,
                    sku: it.sku,
                    qty: it.qty,
                    unitPrice: it.unitPrice,
                    title: it.title,
                }))),
            },
            currency: currency.toLowerCase(),
        });
        return { id: session.id, url: session.url };
    }
    catch (error) {
        console.error("Error creating checkout session:", error);
        throw new functions.https.HttpsError("internal", `Failed to create checkout session: ${error.message}`);
    }
});
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    const sig = req.headers["stripe-signature"];
    if (!sig) {
        console.error("No stripe-signature header");
        res.status(400).send("Missing stripe-signature header");
        return;
    }
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error("STRIPE_WEBHOOK_SECRET not configured");
        res.status(500).send("Webhook secret not configured");
        return;
    }
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    }
    catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    console.log(`Received event: ${event.type}`);
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const uid = session.metadata?.uid;
        const itemsJson = session.metadata?.items;
        if (!uid || !itemsJson) {
            console.error("Missing uid or items in session metadata");
            res.status(400).send("Invalid session metadata");
            return;
        }
        try {
            const items = JSON.parse(itemsJson);
            const orderId = (0, uuid_1.v4)();
            const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
            const orderData = {
                userRef: db.collection("users").doc(uid),
                items: items.map((item) => ({
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
                    intentId: session.payment_intent,
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
                    const formatIndex = formats.findIndex((f) => f.sku === item.sku);
                    if (formatIndex !== -1 && formats[formatIndex].stock >= item.qty) {
                        formats[formatIndex].stock -= item.qty;
                        await releaseRef.update({ formats });
                    }
                }
            }
            const cartRef = db.collection("carts").doc(uid);
            await cartRef.delete();
            console.log(`Order ${orderId} created successfully for user ${uid}`);
        }
        catch (error) {
            console.error("Error processing checkout session:", error);
            res.status(500).send(`Error: ${error.message}`);
            return;
        }
    }
    res.json({ received: true });
});
exports.enrichRelease = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Login required");
    }
    const { releaseId, artist, title, barcode } = data;
    if (!releaseId) {
        throw new functions.https.HttpsError("invalid-argument", "releaseId is required");
    }
    try {
        let mbUrl;
        if (barcode) {
            mbUrl = `https://musicbrainz.org/ws/2/release/?query=barcode:${barcode}&fmt=json`;
        }
        else if (artist && title) {
            mbUrl = `https://musicbrainz.org/ws/2/release/?query=artist:${encodeURIComponent(artist)}%20AND%20release:${encodeURIComponent(title)}&fmt=json`;
        }
        else {
            throw new functions.https.HttpsError("invalid-argument", "Either barcode or both artist and title are required");
        }
        const response = await (0, cross_fetch_1.default)(mbUrl, {
            headers: {
                "User-Agent": "FromDeepestRecord/1.0 (contact@fromdeepestrecord.com)",
            },
        });
        if (!response.ok) {
            throw new Error(`MusicBrainz API error: ${response.statusText}`);
        }
        const json = await response.json();
        if (!json.releases || json.releases.length === 0) {
            throw new functions.https.HttpsError("not-found", "No release found in MusicBrainz");
        }
        const release = json.releases[0];
        const mbid = release.id;
        let coverUrl = "";
        try {
            const coverResponse = await (0, cross_fetch_1.default)(`https://coverartarchive.org/release/${mbid}`, {
                headers: {
                    "User-Agent": "FromDeepestRecord/1.0 (contact@fromdeepestrecord.com)",
                },
            });
            if (coverResponse.ok) {
                const coverJson = await coverResponse.json();
                if (coverJson.images && coverJson.images.length > 0) {
                    coverUrl = coverJson.images[0].thumbnails?.large || coverJson.images[0].image;
                }
            }
        }
        catch (coverError) {
            console.log("Cover art not found, continuing...");
        }
        const updateData = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        if (coverUrl) {
            updateData.cover = coverUrl;
        }
        if (release.country) {
            updateData.country = release.country;
        }
        if (release.date) {
            updateData.releaseDate = admin.firestore.Timestamp.fromDate(new Date(release.date));
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
    }
    catch (error) {
        console.error("Error enriching release:", error);
        throw new functions.https.HttpsError("internal", `Failed to enrich release: ${error.message}`);
    }
});
__exportStar(require("./admin"), exports);
//# sourceMappingURL=index.js.map