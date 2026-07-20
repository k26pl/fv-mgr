import * as z from "zod";

export function GET(req: Request) {}

const post_schema = z.object({
  nip: z.string(),
  forcedData: z.optional(
    z.object({
      name: z.string(),
      accountNumbers: z.array(z.string()),
      address: z.string(),
      default_cat: z.optional(z.string()),
    }),
  ),
});

export function POST(req: Request) {}
export function DELETE(req: Request) {}
