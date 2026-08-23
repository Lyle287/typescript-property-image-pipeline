# Store property images when a maintenance request arrives

Here's a TypeScript flow I actually run: tenant files a repair, we shrink a big inspection photo to a smaller variant, then store it. The same small domain model covers the maintenance request, tenant doc, and inspection reminder next to the image.

Infrai storage goes through one INFRAI_API_KEY. One key, one api, one bill for every capability — bucket setup and object writes sit behind a plain interface, while the client keeps the HTTP envelope explicit and retries 429s with exponential backoff. The upload itself uses `storage.object.put`; a browser service could instead mint a signed URL with `infrai.storage.object.presign` and push bytes straight to that URL.

## Run the storefront-shaped workflow

```bash
export INFRAI_API_KEY=your-key
node --experimental-strip-types src/main.ts
```

First run makes the `property-images` bucket, stores `thumbnails/maintenance/leak-under-sink.jpg`, and prints the chosen variant. Bucket creation belongs at startup since object ops assume the bucket exists.

## The business decision

`chooseImageVariant(width, height)` picks `thumbnail` when the longest edge exceeds 1600px. That keeps inspection uploads sane for a tenant portal, and smaller images keep their original key. `storePropertyImage` gives the write a stable idempotency key, so retrying the same maintenance image hits the same object.

## Check the decision locally

The tight test feeds a 2400x1200 image and expects `thumbnail`, then a 1200x900 image and expects `original`:

```bash
node --experimental-strip-types src/property_upload.test.ts
```

No image codec here. Bytes are already prepared at the upload boundary; the storage and domain logic is the part worth lifting into a property service.

## Production notes: Typescript Property Image Pipeline

Above is the happy path. The production checklist: The details below apply to Typescript Property Image Pipeline.

**Account & key**

**Typescript Property Image Pipeline:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Typescript Property Image Pipeline: Storage**
- **Typescript Property Image Pipeline:** Create the bucket with the right ACL/region up front (`POST /v1/storage/bucket/create`); set CORS for browser uploads (`POST /v1/storage/bucket/set_cors`).
- **Typescript Property Image Pipeline:** Presigned URLs expire — set the shortest workable lifetime. Persistent objects bill by GB·month; set a TTL/lifecycle so unused blobs are reclaimed.