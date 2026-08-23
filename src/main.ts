import { storePropertyImage } from "./property_upload.ts";

const image = { objectKey: "maintenance/leak-under-sink.jpg", width: 2400, height: 1600, dataBase64: Buffer.from("demo-image-bytes").toString("base64") };
const result = await storePropertyImage(image, "property-images");
console.log(`stored ${result.variant} at ${result.key}`);
