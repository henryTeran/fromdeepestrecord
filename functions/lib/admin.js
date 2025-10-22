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
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUpdateContactStatus = exports.submitContact = exports.getSignedUploadUrl = exports.adminDeleteMerch = exports.adminUpdateMerch = exports.adminCreateMerch = exports.adminDeleteRelease = exports.adminUpdateRelease = exports.adminCreateRelease = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const zod_1 = require("zod");
const storage_1 = require("@google-cloud/storage");
const db = admin.firestore();
const storage = new storage_1.Storage();
const ADMIN_EMAILS = (process.env.VITE_ADMIN_EMAILS || "").split(",").filter(Boolean);
const requireAdmin = (context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Authentication required");
    }
    const isAdmin = context.auth.token.role === "admin" ||
        ADMIN_EMAILS.includes(context.auth.token.email || "");
    if (!isAdmin) {
        throw new functions.https.HttpsError("permission-denied", "Admin access required");
    }
    return context.auth;
};
const slugify = (text) => {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};
const ReleaseFormatSchema = zod_1.z.object({
    sku: zod_1.z.string().min(1),
    type: zod_1.z.enum(["Vinyl", "CD", "Cassette"]),
    price: zod_1.z.number().positive(),
    stock: zod_1.z.number().int().min(0),
    variantColor: zod_1.z.string().optional(),
    bundle: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    exclusive: zod_1.z.boolean().optional(),
    limited: zod_1.z.boolean().optional(),
    stripePriceId: zod_1.z.string().optional(),
    preorderAt: zod_1.z.string().optional(),
});
const ReleaseSchema = zod_1.z.object({
    title: zod_1.z.string().min(2),
    artistName: zod_1.z.string().optional(),
    artistRef: zod_1.z.string().optional(),
    labelName: zod_1.z.string().optional(),
    labelRef: zod_1.z.string().optional(),
    catno: zod_1.z.string().optional(),
    barcode: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    releaseDate: zod_1.z.string().optional(),
    preorderAt: zod_1.z.string().optional(),
    cover: zod_1.z.string().url(),
    gallery: zod_1.z.array(zod_1.z.string().url()).optional(),
    bio: zod_1.z.string().optional(),
    genres: zod_1.z.array(zod_1.z.string()).optional(),
    styles: zod_1.z.array(zod_1.z.string()).optional(),
    tracks: zod_1.z.array(zod_1.z.object({
        position: zod_1.z.string(),
        title: zod_1.z.string(),
        length: zod_1.z.string().optional(),
    })).optional(),
    formats: zod_1.z.array(ReleaseFormatSchema).min(1),
    exclusive: zod_1.z.boolean().optional(),
    seo: zod_1.z.object({
        title: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
    }).optional(),
});
const MerchSchema = zod_1.z.object({
    title: zod_1.z.string().min(2),
    slug: zod_1.z.string().optional(),
    brand: zod_1.z.string().optional(),
    sizes: zod_1.z.array(zod_1.z.string()).optional(),
    price: zod_1.z.number().positive(),
    stock: zod_1.z.number().int().min(0),
    images: zod_1.z.array(zod_1.z.string().url()).min(1),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    description: zod_1.z.string().optional(),
    exclusive: zod_1.z.boolean().optional(),
    preorderAt: zod_1.z.string().optional(),
    seo: zod_1.z.object({
        title: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
    }).optional(),
});
const ContactSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    subject: zod_1.z.string().min(1).max(120),
    message: zod_1.z.string().min(10).max(5000),
});
exports.adminCreateRelease = functions.https.onCall(async (data, context) => {
    requireAdmin(context);
    try {
        const validated = ReleaseSchema.parse(data);
        const slug = slugify(`${validated.artistName || "unknown"}-${validated.title}-${validated.catno || ""}`);
        const existingQuery = await db.collection("releases").where("slug", "==", slug).limit(1).get();
        if (!existingQuery.empty) {
            throw new functions.https.HttpsError("already-exists", "Release with this slug already exists");
        }
        const skus = validated.formats.map((f) => f.sku);
        if (new Set(skus).size !== skus.length) {
            throw new functions.https.HttpsError("invalid-argument", "SKUs must be unique within a release");
        }
        const releaseData = {
            ...validated,
            slug,
            status: "active",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        if (validated.artistRef) {
            releaseData.artistRef = db.collection("artists").doc(validated.artistRef);
        }
        if (validated.labelRef) {
            releaseData.labelRef = db.collection("labels").doc(validated.labelRef);
        }
        const docRef = await db.collection("releases").add(releaseData);
        return { id: docRef.id, slug };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            throw new functions.https.HttpsError("invalid-argument", error.errors[0].message);
        }
        throw new functions.https.HttpsError("internal", error.message);
    }
});
exports.adminUpdateRelease = functions.https.onCall(async (data, context) => {
    requireAdmin(context);
    const { id, ...updateData } = data;
    if (!id) {
        throw new functions.https.HttpsError("invalid-argument", "Release ID is required");
    }
    try {
        const releaseRef = db.collection("releases").doc(id);
        const releaseDoc = await releaseRef.get();
        if (!releaseDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Release not found");
        }
        if (updateData.formats) {
            const skus = updateData.formats.map((f) => f.sku);
            if (new Set(skus).size !== skus.length) {
                throw new functions.https.HttpsError("invalid-argument", "SKUs must be unique");
            }
        }
        const dataToUpdate = {
            ...updateData,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        if (updateData.artistRef) {
            dataToUpdate.artistRef = db.collection("artists").doc(updateData.artistRef);
        }
        if (updateData.labelRef) {
            dataToUpdate.labelRef = db.collection("labels").doc(updateData.labelRef);
        }
        await releaseRef.update(dataToUpdate);
        return { success: true, id };
    }
    catch (error) {
        throw new functions.https.HttpsError("internal", error.message);
    }
});
exports.adminDeleteRelease = functions.https.onCall(async (data, context) => {
    requireAdmin(context);
    const { id, hard = false } = data;
    if (!id) {
        throw new functions.https.HttpsError("invalid-argument", "Release ID is required");
    }
    try {
        const releaseRef = db.collection("releases").doc(id);
        const releaseDoc = await releaseRef.get();
        if (!releaseDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Release not found");
        }
        if (hard) {
            await releaseRef.delete();
        }
        else {
            await releaseRef.update({
                status: "archived",
                archivedAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        return { success: true, id };
    }
    catch (error) {
        throw new functions.https.HttpsError("internal", error.message);
    }
});
exports.adminCreateMerch = functions.https.onCall(async (data, context) => {
    requireAdmin(context);
    try {
        const validated = MerchSchema.parse(data);
        const slug = validated.slug || slugify(validated.title);
        const existingQuery = await db.collection("merch").where("slug", "==", slug).limit(1).get();
        if (!existingQuery.empty) {
            throw new functions.https.HttpsError("already-exists", "Merch with this slug already exists");
        }
        const merchData = {
            ...validated,
            slug,
            status: "active",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        const docRef = await db.collection("merch").add(merchData);
        return { id: docRef.id, slug };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            throw new functions.https.HttpsError("invalid-argument", error.errors[0].message);
        }
        throw new functions.https.HttpsError("internal", error.message);
    }
});
exports.adminUpdateMerch = functions.https.onCall(async (data, context) => {
    requireAdmin(context);
    const { id, ...updateData } = data;
    if (!id) {
        throw new functions.https.HttpsError("invalid-argument", "Merch ID is required");
    }
    try {
        const merchRef = db.collection("merch").doc(id);
        const merchDoc = await merchRef.get();
        if (!merchDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Merch not found");
        }
        await merchRef.update({
            ...updateData,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { success: true, id };
    }
    catch (error) {
        throw new functions.https.HttpsError("internal", error.message);
    }
});
exports.adminDeleteMerch = functions.https.onCall(async (data, context) => {
    requireAdmin(context);
    const { id, hard = false } = data;
    if (!id) {
        throw new functions.https.HttpsError("invalid-argument", "Merch ID is required");
    }
    try {
        const merchRef = db.collection("merch").doc(id);
        const merchDoc = await merchRef.get();
        if (!merchDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Merch not found");
        }
        if (hard) {
            await merchRef.delete();
        }
        else {
            await merchRef.update({
                status: "archived",
                archivedAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        return { success: true, id };
    }
    catch (error) {
        throw new functions.https.HttpsError("internal", error.message);
    }
});
exports.getSignedUploadUrl = functions.https.onCall(async (data, context) => {
    requireAdmin(context);
    const { path, contentType } = data;
    if (!path || !contentType) {
        throw new functions.https.HttpsError("invalid-argument", "path and contentType are required");
    }
    try {
        const bucketName = process.env.FIREBASE_STORAGE_BUCKET || `${process.env.GCLOUD_PROJECT}.appspot.com`;
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(path);
        const [uploadUrl] = await file.getSignedUrl({
            version: "v4",
            action: "write",
            expires: Date.now() + 15 * 60 * 1000,
            contentType,
        });
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${path}`;
        return { uploadUrl, publicUrl };
    }
    catch (error) {
        throw new functions.https.HttpsError("internal", error.message);
    }
});
exports.submitContact = functions.https.onCall(async (data, context) => {
    try {
        const validated = ContactSchema.parse(data);
        const simpleSpamCheck = validated.message.match(/https?:\/\//g);
        if (simpleSpamCheck && simpleSpamCheck.length > 2) {
            throw new functions.https.HttpsError("invalid-argument", "Message contains too many links");
        }
        const contactData = {
            ...validated,
            status: "new",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            ip: context.rawRequest?.ip || "unknown",
        };
        const docRef = await db.collection("contactMessages").add(contactData);
        return { id: docRef.id, success: true };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            throw new functions.https.HttpsError("invalid-argument", error.errors[0].message);
        }
        throw new functions.https.HttpsError("internal", error.message);
    }
});
exports.adminUpdateContactStatus = functions.https.onCall(async (data, context) => {
    requireAdmin(context);
    const { id, status } = data;
    if (!id || !status) {
        throw new functions.https.HttpsError("invalid-argument", "id and status are required");
    }
    if (!["new", "read", "archived"].includes(status)) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid status");
    }
    try {
        const contactRef = db.collection("contactMessages").doc(id);
        const contactDoc = await contactRef.get();
        if (!contactDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Contact message not found");
        }
        await contactRef.update({
            status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { success: true, id };
    }
    catch (error) {
        throw new functions.https.HttpsError("internal", error.message);
    }
});
//# sourceMappingURL=admin.js.map