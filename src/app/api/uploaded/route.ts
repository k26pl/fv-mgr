import * as z from "zod";
import { getDownloadLink } from "@/backend/b2";
import { prisma } from "@/backend/db";

export async function GET(req: Request) {
  try {
    let files = await prisma.uploadedFile.findMany({
      where: {
        dataExtracted: false,
      },
    });
    let data = await Promise.all(
      files.map(async (f) => ({
        name: f.fileName,
        link: await getDownloadLink(f.id),
        id: f.id,
        date: f.uploadDate.toISOString(),
      })),
    );

    return new Response(JSON.stringify(data));
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
