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
