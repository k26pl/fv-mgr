import * as z from "zod";
import { getUploadLink } from "@/backend/b2";
import { prisma } from "@/backend/db";

const UploadReq = z.object({
  files: z.array(
    z.object({
      type: z.enum(["xml", "pdf"]),
      name: z.string(),
      size: z.number(),
    }),
  ),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const data = UploadReq.parse(json);
    const urls = await Promise.all(
      data.files.map(async (file) => ({
        ...(await getUploadLink()),
        name: file.name,
      })),
    );
    prisma.uploadedFile.createMany({
      data: urls.map((f) => ({
        id: f.id,
        fileName: f.name,
        link: f.link,
        uploadError: false,
        uploadFinished: false,
      })),
    });

    return new Response(JSON.stringify(urls));
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error(`request data validation failed:`, err.issues);
      return new Response(
        JSON.stringify({ err: "Serwer otrzymał dane w niepoprawnym formacie" }),
        { status: 400 },
      );
    } else {
      console.error(err);
      return new Response(
        JSON.stringify({ err: "Wystąpił wewnętrzny błąd serwera" }),
        { status: 500 },
      );
    }
  }
}
