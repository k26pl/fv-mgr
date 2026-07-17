import { B2Client } from "@backblaze-labs/b2-sdk";
import {
  presignS3GetObjectUrl,
  presignS3PutObjectUrl,
} from "@backblaze-labs/b2-sdk/s3";
const client = new B2Client({
  applicationKeyId: process.env.B2_KEYID!,
  applicationKey: process.env.B2_KEY!,
});

await client.authorize();
const bkt = await client.getBucket(process.env.B2_BUCKET!);
if (!bkt) throw new Error("No bucket configured");
// If someone can put a hostile page on your localhost
// you probably have bigger problems.
// However, in prod settings the localhost origin should be
// disabled as a good security practice
// As this is a demo app, i left it here for convience
const origins = ["http://localhost:3000"];
if (process.env.ORIGIN) {
  origins.push(process.env.ORIGIN);
}
bkt.update({
  corsRules: [
    {
      allowedOrigins: origins,
      allowedHeaders: ["content-type"],
      allowedOperations: ["s3_get", "s3_put"],
      corsRuleName: "allow-web-access",
      exposeHeaders: [],
      maxAgeSeconds: 3600,
    },
  ],
});

export async function getUploadLink() {
  const id = crypto.randomUUID();
  const link = await presignS3PutObjectUrl({
    applicationKeyId: process.env.B2_KEYID!,
    applicationKey: process.env.B2_KEY!,
    accountInfo: client.accountInfo,
    bucketName: process.env.B2_BUCKET!,
    fileName: `${id}.pdf`,
  });

  return {
    id,
    link,
  };
}
export async function getDownloadLink(id: string) {
  const link = await presignS3GetObjectUrl({
    applicationKeyId: process.env.B2_KEYID!,
    applicationKey: process.env.B2_KEY!,
    accountInfo: client.accountInfo,
    bucketName: process.env.B2_BUCKET!,
    fileName: `${id}.pdf`,
  });

  return link;
}
