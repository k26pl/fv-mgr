import * as z from "zod";
import { getUploadLink } from "@/backend/b2";
import { prisma } from "@/backend/db";

const UploadReq = z.object({
  files: z.array(
    z.object({
      id: z.string(),
    }),
  ),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const data = UploadReq.parse(json);
    prisma.uploadedFile.updateManyAndReturn({
      data: {
        uploadFinished: true,
      },
      where: {
        id: {
          in: data.files.map((e) => e.id),
        },
      },
    });

    return new Response(JSON.stringify({ ok: true }));
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error(`request data validation failed:`, err.issues);
      return new Response(
        JSON.stringify({
          err: "Serwer otrzymał dane w niepoprawnym formacie",
          ok: false,
        }),
        { status: 400 },
      );
    } else {
      console.error(err);
      return new Response(
        JSON.stringify({ err: "Wystąpił wewnętrzny błąd serwera", ok: false }),
        { status: 500 },
      );
    }
  }
}
