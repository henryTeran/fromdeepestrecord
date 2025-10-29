import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { z } from "zod";
import { Storage } from "@google-cloud/storage";
import { applyCors } from "./cors";

const db = admin.firestore();
const storage = new Storage();

const ADMIN_EMAILS = (process.env.VITE_ADMIN_EMAILS || "").split(",").filter(Boolean);

const requireAdmin = (context: functions.https.CallableContext) => {
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

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const ReleaseFormatSchema = z.object({
  sku: z.string().min(1),
  type: z.enum(["Vinyl", "CD", "Cassette"]),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  variantColor: z.string().optional(),
  bundle: z.string().optional(),
  description: z.string().optional(),
  exclusive: z.boolean().optional(),
  limited: z.boolean().optional(),
  stripePriceId: z.string().optional(),
  preorderAt: z.string().optional(),
});

const ReleaseSchema = z.object({
  title: z.string().min(2),
  artistName: z.string().optional(),
  artistRef: z.string().optional(),
  labelName: z.string().optional(),
  labelRef: z.string().optional(),
  catno: z.string().optional(),
  barcode: z.string().optional(),
  country: z.string().optional(),
  releaseDate: z.string().optional(),
  preorderAt: z.string().optional(),
  cover: z.string().url(),
  gallery: z.array(z.string().url()).optional(),
  bio: z.string().optional(),
  genres: z.array(z.string()).optional(),
  styles: z.array(z.string()).optional(),
  tracks: z.array(z.object({
    position: z.string(),
    title: z.string(),
    length: z.string().optional(),
  })).optional(),
  formats: z.array(ReleaseFormatSchema).min(1),
  exclusive: z.boolean().optional(),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
});

const MerchSchema = z.object({
  title: z.string().min(2),
  slug: z.string().optional(),
  brand: z.string().optional(),
  sizes: z.array(z.string()).optional(),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  images: z.array(z.string().url()).min(1),
  tags: z.array(z.string()).optional(),
  description: z.string().optional(),
  exclusive: z.boolean().optional(),
  preorderAt: z.string().optional(),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
});

const ContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1).max(120),
  message: z.string().min(10).max(5000),
});

export const adminCreateRelease = functions.region("us-central1").https.onCall(async (data, context) => {
  requireAdmin(context);

  try {
    const validated = ReleaseSchema.parse(data);

    const slug = slugify(
      `${validated.artistName || "unknown"}-${validated.title}-${validated.catno || ""}`
    );

    const existingQuery = await db.collection("releases").where("slug", "==", slug).limit(1).get();
    if (!existingQuery.empty) {
      throw new functions.https.HttpsError("already-exists", "Release with this slug already exists");
    }

    const skus = validated.formats.map((f: any) => f.sku);
    if (new Set(skus).size !== skus.length) {
      throw new functions.https.HttpsError("invalid-argument", "SKUs must be unique within a release");
    }

    const releaseData: any = {
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
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new functions.https.HttpsError("invalid-argument", error.errors[0].message);
    }
    throw new functions.https.HttpsError("internal", error.message);
  }
});

export const adminUpdateRelease = functions.region("us-central1").https.onCall(async (data, context) => {
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
      const skus = updateData.formats.map((f: any) => f.sku);
      if (new Set(skus).size !== skus.length) {
        throw new functions.https.HttpsError("invalid-argument", "SKUs must be unique");
      }
    }

    const dataToUpdate: any = {
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
  } catch (error: any) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});

export const adminDeleteRelease = functions.region("us-central1").https.onCall(async (data, context) => {
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
    } else {
      await releaseRef.update({
        status: "archived",
        archivedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return { success: true, id };
  } catch (error: any) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});

export const adminCreateMerch = functions.region("us-central1").https.onCall(async (data, context) => {
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
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new functions.https.HttpsError("invalid-argument", error.errors[0].message);
    }
    throw new functions.https.HttpsError("internal", error.message);
  }
});

export const adminUpdateMerch = functions.region("us-central1").https.onCall(async (data, context) => {
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
  } catch (error: any) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});

export const adminDeleteMerch = functions.region("us-central1").https.onCall(async (data, context) => {
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
    } else {
      await merchRef.update({
        status: "archived",
        archivedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return { success: true, id };
  } catch (error: any) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});

export const getSignedUploadUrl = functions.region("us-central1").https.onCall(async (data, context) => {
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
  } catch (error: any) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});

export const submitContact = functions.region("us-central1").https.onCall(async (data, context) => {
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
    };

    const docRef = await db.collection("contactMessages").add(contactData);

    return { id: docRef.id, success: true };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new functions.https.HttpsError("invalid-argument", error.errors[0].message);
    }
    throw new functions.https.HttpsError("internal", error.message);
  }
});

export const adminUpdateContactStatus = functions.region("us-central1").https.onCall(async (data, context) => {
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
  } catch (error: any) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});
