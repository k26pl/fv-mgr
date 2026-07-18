import { prisma } from "@/backend/db";
import * as z from "zod";

export async function GET(req: Request) {
  let data;
  try {
    data = { c: await prisma.category.findMany(), ok: true };
  } catch (e) {
    data = { ok: false, err: "Wewnętrzny błąd serwera" };
  }
  return new Response(JSON.stringify(data), { status: data.ok ? 200 : 500 });
}
const post_schema = z.object({
  name: z.string(),
  parent: z.optional(z.string()),
});
export async function POST(req: Request) {
  try {
    const data = post_schema.parse(await req.json());
    console.log(data);
    let err = undefined;
    try {
      await prisma.category.create({
        data: {
          name: data.name,
          parentName: data.parent,
        },
      });
    } catch (e) {
      //@ts-ignore explicit runtime check for correct type
      if (e && typeof e.code === "string" && e.code === "P2002") {
        err = "Kategoria z taką nazwą już istnieje";
      } else {
        console.error(e);
        err = "Wystąpił wewnętrzny błąd serwera";
      }
    }
    return new Response(
      JSON.stringify({ c: await prisma.category.findMany(), err }),
    );
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

//@TODO:  category removal?
//        all already uploaded documents using that category
//        will need to be updated
//        Also likely categories will (as with pretty much all other data)
//        will not be supposed to be actually deleted
//        for audit log, legal, archival and so on reasons
