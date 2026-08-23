import { infrai } from "./infrai_storage.ts";

export type MaintenanceRequest = { id: string; tenantId: string; description: string };
export type TenantDocument = { id: string; tenantId: string; objectKey: string };
export type InspectionReminder = { requestId: string; dueOn: string };
export type ImageUpload = { objectKey: string; width: number; height: number; dataBase64: string };

export function chooseImageVariant(width: number, height: number): "original" | "thumbnail" {
  return Math.max(width, height) > 1600 ? "thumbnail" : "original";
}

export async function storePropertyImage(input: ImageUpload, bucket: string): Promise<{ key: string; variant: string }> {
  await infrai.storage.bucket.create({ name: bucket });
  const variant = chooseImageVariant(input.width, input.height);
  const key = variant === "thumbnail" ? `thumbnails/${input.objectKey}` : input.objectKey;
  await infrai.storage.object.put(bucket, key, {
    data_base64: input.dataBase64,
    content_type: "image/jpeg",
    idempotency_key: `property-image:${key}`,
  });
  return { key, variant };
}

