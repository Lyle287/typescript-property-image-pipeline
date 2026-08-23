import { strict as assert } from "node:assert";
import { chooseImageVariant } from "./property_upload.ts";

assert.equal(chooseImageVariant(2400, 1200), "thumbnail");
assert.equal(chooseImageVariant(1200, 900), "original");
console.log("image variant decision passed");
