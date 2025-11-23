import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { z } from "zod";
import { ZodError } from "zod";
import { Storage } from "@google-cloud/storage";

const db = admin.firestore();
const storage = new Storage();

const ADMIN_EMAILS = (process.env.VITE_ADMIN_EMAILS || "").split(",").filter(Boolean);

console.log(ADMIN_EMAILS);
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

// Replace null values with undefined recursively so Zod optional() accepts them
function replaceNulls<T>(obj: T): T {
  if (obj === null) return undefined as unknown as T;
  if (Array.isArray(obj)) return obj.map((v: any) => replaceNulls(v)) as unknown as T;
  if (typeof obj === "object" && obj !== null) {
    const out: any = {};
    for (const [k, v] of Object.entries(obj as any)) {
      out[k] = v === null ? undefined : replaceNulls(v);
    }
    return out as T;
  }
  return obj;
}

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
    const sanitized = replaceNulls(data);
    const validated = ReleaseSchema.parse(sanitized);

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

    // Convert string dates to Firestore Timestamps when provided
    if (validated.releaseDate && typeof validated.releaseDate === 'string') {
      try {
        releaseData.releaseDate = admin.firestore.Timestamp.fromDate(new Date(validated.releaseDate));
      } catch (e) {
        // leave as-is; validation should have prevented invalid date
      }
    }

    if (validated.preorderAt && typeof validated.preorderAt === 'string') {
      try {
        releaseData.preorderAt = admin.firestore.Timestamp.fromDate(new Date(validated.preorderAt));
      } catch (e) {}
    }

    // Convert format-level preorderAt strings too
    if (Array.isArray(validated.formats)) {
      releaseData.formats = validated.formats.map((f: any) => {
        const copy = { ...f };
        if (copy.preorderAt && typeof copy.preorderAt === 'string') {
          try {
            copy.preorderAt = admin.firestore.Timestamp.fromDate(new Date(copy.preorderAt));
          } catch (e) {}
        }
        return copy;
      });
    }

    if (validated.artistRef) {
      releaseData.artistRef = db.collection("artists").doc(validated.artistRef);
    }

    if (validated.labelRef) {
      releaseData.labelRef = db.collection("labels").doc(validated.labelRef);
    }

    // Remove undefined values before writing to Firestore
    const cleanedReleaseData = removeUndefined(releaseData as any);

    const docRef = await db.collection("releases").add(cleanedReleaseData);

    return { id: docRef.id, slug };
  } catch (error) {
    console.error("adminCreateRelease validation failed:", error);
    throw new functions.https.HttpsError(
      "invalid-argument",
      firstZodIssueMessage(error, "Invalid request payload")
    );
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

    // Convert string dates to Firestore Timestamps if present in update
    if (dataToUpdate.releaseDate && typeof dataToUpdate.releaseDate === 'string') {
      try {
        dataToUpdate.releaseDate = admin.firestore.Timestamp.fromDate(new Date(dataToUpdate.releaseDate));
      } catch (e) {}
    }

    if (dataToUpdate.preorderAt && typeof dataToUpdate.preorderAt === 'string') {
      try {
        dataToUpdate.preorderAt = admin.firestore.Timestamp.fromDate(new Date(dataToUpdate.preorderAt));
      } catch (e) {}
    }

    if (Array.isArray(dataToUpdate.formats)) {
      dataToUpdate.formats = dataToUpdate.formats.map((f: any) => {
        const copy = { ...f };
        if (copy.preorderAt && typeof copy.preorderAt === 'string') {
          try {
            copy.preorderAt = admin.firestore.Timestamp.fromDate(new Date(copy.preorderAt));
          } catch (e) {}
        }
        return copy;
      });
    }

    if (updateData.artistRef) {
      dataToUpdate.artistRef = db.collection("artists").doc(updateData.artistRef);
    }

    if (updateData.labelRef) {
      dataToUpdate.labelRef = db.collection("labels").doc(updateData.labelRef);
    }

    const cleanedUpdate = removeUndefined(dataToUpdate as any);
    await releaseRef.update(cleanedUpdate);

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

export const adminCreateMerch = functions
  .region("us-central1")
  .https.onCall(async (data, context) => {
    requireAdmin(context);

    try {
      const validated = MerchSchema.parse(data);

      const slug = validated.slug || slugify(validated.title);

      const existingQuery = await db
        .collection("merch")
        .where("slug", "==", slug)
        .limit(1)
        .get();

      if (!existingQuery.empty) {
        throw new functions.https.HttpsError(
          "already-exists",
          "Merch with this slug already exists"
        );
      }

      const merchData = {
        ...validated,
        slug,
        status: "active",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (validated.preorderAt && typeof validated.preorderAt === 'string') {
        try {
          (merchData as any).preorderAt = admin.firestore.Timestamp.fromDate(new Date(validated.preorderAt));
        } catch (e) {}
      }

      const cleanedMerchData = removeUndefined(merchData as any);
      const docRef = await db.collection("merch").add(cleanedMerchData);

      // ✅ onCall doit retourner un objet
      return { id: docRef.id, slug };
    } catch (error) {
      // ✅ ZodError → utiliser issues, pas errors
      const message = firstZodIssueMessage(error, "Invalid request payload");
      // ✅ onCall → on lance un HttpsError
      throw new functions.https.HttpsError("invalid-argument", message);
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

    // Convert date strings to Timestamps for updates
    if (updateData.preorderAt && typeof updateData.preorderAt === 'string') {
      try {
        updateData.preorderAt = admin.firestore.Timestamp.fromDate(new Date(updateData.preorderAt));
      } catch (e) {}
    }

    const merchUpdatePayload = removeUndefined({
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    } as any);
    await merchRef.update(merchUpdatePayload);

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
    const bucketName =
      process.env.VITE_FB_STORAGE ||
      (process.env.GCLOUD_PROJECT ? `${process.env.GCLOUD_PROJECT}.appspot.com` : undefined) ||
      (process.env.GCP_PROJECT ? `${process.env.GCP_PROJECT}.appspot.com` : undefined);

    if (!bucketName) {
      console.error("No bucket configured for signed URL. Check VITE_FB_STORAGE/GCLOUD_PROJECT/GCP_PROJECT env vars");
      throw new Error("Storage bucket not configured");
    }

    console.log("Generating signed upload url", { bucketName, path, contentType });
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(path);

    const [uploadUrl] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: new Date(Date.now() + 15 * 60 * 1000),
      contentType,
    });

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${path}`;

    return { uploadUrl, publicUrl };
  } catch (error: any) {
    // Log full error for diagnostics
    console.error("getSignedUploadUrl error:", error && error.stack ? error.stack : error);

    const msg = String(error?.message || error || "Unknown error");

    // Detect common IAM signBlob permission issue and return clear guidance
    if (msg.includes("signBlob") || msg.includes("iam.serviceAccounts.signBlob") || msg.includes("Permission 'iam.serviceAccounts.signBlob'")) {
      const guidance =
        "Insufficient IAM permissions to sign upload URLs. Grant the Cloud Functions service account the role 'roles/iam.serviceAccountTokenCreator' (Service Account Token Creator) or allow the service account to sign blobs. Example:\n" +
        "gcloud projects add-iam-policy-binding YOUR_PROJECT_ID --member=serviceAccount:YOUR_FUNCTIONS_SA_EMAIL --role=roles/iam.serviceAccountTokenCreator\n" +
        "Replace YOUR_FUNCTIONS_SA_EMAIL with the functions runtime service account (e.g. PROJECT_ID@appspot.gserviceaccount.com)";

      throw new functions.https.HttpsError("permission-denied", guidance);
    }

    // For invalid input, surface INVALID_ARGUMENT to the client
    if (msg.includes("Invalid") || msg.includes("invalid")) {
      throw new functions.https.HttpsError("invalid-argument", msg);
    }

    throw new functions.https.HttpsError("internal", msg);
  }
});

// Retourne une URL signée en lecture pour un fichier existant
export const getSignedDownloadUrl = functions.region("us-central1").https.onCall(async (data, context) => {
  requireAdmin(context);

  const { path } = data || {};
  if (!path || typeof path !== "string") {
    throw new functions.https.HttpsError("invalid-argument", "path is required");
  }

  try {
    const bucketName =
      process.env.VITE_FB_STORAGE ||
      (process.env.GCLOUD_PROJECT ? `${process.env.GCLOUD_PROJECT}.appspot.com` : undefined) ||
      (process.env.GCP_PROJECT ? `${process.env.GCP_PROJECT}.appspot.com` : undefined);

    if (!bucketName) {
      console.error("No bucket configured for signed URL (download)");
      throw new functions.https.HttpsError("failed-precondition", "Storage bucket not configured");
    }

    const file = storage.bucket(bucketName).file(path);
    const [exists] = await file.exists();
    if (!exists) {
      throw new functions.https.HttpsError("not-found", "File not found");
    }

    const [downloadUrl] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: new Date(Date.now() + 60 * 60 * 1000),
    });

    return { downloadUrl };
  } catch (error: any) {
    console.error("getSignedDownloadUrl error:", error && error.stack ? error.stack : error);
    const msg = String(error?.message || error || "Unknown error");
    if (msg.includes("signBlob") || msg.includes("iam.serviceAccounts.signBlob")) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Missing IAM permission to sign URLs. Grant roles/iam.serviceAccountTokenCreator to the functions service account."
      );
    }
    throw new functions.https.HttpsError("internal", msg);
  }
});

export const submitContact = functions
  .region("us-central1")
  .https.onCall(async (data, context) => {
    try {
      const validated = ContactSchema.parse(data);

      const links = validated.message.match(/https?:\/\//g);
      if (links && links.length > 2) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Message contains too many links"
        );
      }

      const contactData = {
        ...validated,
        status: "new",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await db.collection("contactMessages").add(contactData);

      // ✅ onCall → return, pas res.json
      return { id: docRef.id, success: true };
    } catch (error) {
      const message = firstZodIssueMessage(error, "Failed to submit contact");
      // Si c’est une erreur de validation, invalid-argument ; sinon internal
      if (error instanceof ZodError) {
        throw new functions.https.HttpsError("invalid-argument", message);
      }
      throw new functions.https.HttpsError(
        "internal",
        error instanceof Error ? error.message : message
      );
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


function firstZodIssueMessage(err: unknown, fallback = "Invalid input") {
  if (err instanceof ZodError && Array.isArray(err.issues) && err.issues[0]) {
    const issue = err.issues[0];
    const path = Array.isArray(issue.path) && issue.path.length ? issue.path.join(".") : undefined;
    return path ? `${path}: ${issue.message}` : issue.message;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

// Remove undefined values recursively to avoid Firestore write errors
function removeUndefined<T>(obj: T): T {
  if (obj === undefined) return undefined as unknown as T;
  if (obj === null) return null as unknown as T;
  if (Array.isArray(obj)) return obj.map((v: any) => removeUndefined(v)) as unknown as T;
  if (typeof obj === 'object' && obj !== null) {
    const out: any = {};
    for (const [k, v] of Object.entries(obj as any)) {
      if (v === undefined) continue;
      const cleaned = removeUndefined(v);
      if (cleaned === undefined) continue;
      out[k] = cleaned;
    }
    return out as T;
  }
  return obj;
}