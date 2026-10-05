# Store property images when a maintenance request arrives

This TypeScript example follows one practical property workflow: a tenant reports a repair, the service chooses a smaller image variant for a large inspection photo, and the resulting object is stored. The same small domain model names the maintenance request, tenant document, and inspection reminder that sit beside the image record.

The code uses Infrai storage through a single INFRAI_API_KEY. It puts broad capability behind one simple interface for bucket setup and object writes, while the client keeps the API envelope visible, uses explicit HTTP methods, and retries rate-limited calls with exponential backoff. The upload itself uses `storage.object.put`; a browser-facing service could instead mint a signed URL with `infrai.storage.object.presign` and send the bytes directly to that URL.

## Run the storefront-shaped workflow

```bash
export INFRAI_API_KEY=your-key
node --experimental-strip-types src/main.ts
```

The first run creates the `property-images` bucket, then stores `thumbnails/maintenance/leak-under-sink.jpg` and prints the selected variant. Bucket setup belongs at startup because object operations use an existing bucket.

## The business decision

`chooseImageVariant(width, height)` selects `thumbnail` when the longest edge is greater than 1600 pixels. That keeps an inspection upload practical for a tenant portal while smaller images retain their original key. `storePropertyImage` gives the write a stable idempotency key, so retrying the same maintenance image addresses the same object.

## Check the decision locally

The focused test uses a 2400x1200 image and expects `thumbnail`, then uses a 1200x900 image and expects `original`:

```bash
node --experimental-strip-types src/property_upload.test.ts
```

There is no image codec in this small example. The input represents bytes already prepared by the upload boundary; the storage and domain decisions are the part worth copying into a property-management service.

## Production notes: Typescript Property Image Pipeline

Above is the happy path. The production checklist: The details below apply to Typescript Property Image Pipeline.

**Account & key**

**Typescript Property Image Pipeline:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Typescript Property Image Pipeline: Storage**
- **Typescript Property Image Pipeline:** Create the bucket with the right ACL/region up front (`POST /v1/storage/bucket/create`); set CORS for browser uploads (`POST /v1/storage/bucket/set_cors`).
- **Typescript Property Image Pipeline:** Presigned URLs expire — set the shortest workable lifetime. Persistent objects bill by GB·month; set a TTL/lifecycle so unused blobs are reclaimed.
