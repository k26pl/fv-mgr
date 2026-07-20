import { LastSyncState, addTime, getState } from "@/backend/ksef/scheduler";
import * as z from "zod";

export function GET(req: Request) {
  return new Response(JSON.stringify({ ok: true, ...getState() }));
}

const post_schema = z.object({
  hour: z.number(),
  minute: z.number(),
});

export async function POST(req: Request) {
  let ok = false;
  try {
    let data = post_schema.parse(await req.json());
    if (
      data.hour < 0 ||
      data.minute < 0 ||
      data.minute > 59 ||
      data.hour > 23
    ) {
      throw new Error("Invalid time");
    }
    addTime(data.hour, data.minute);
  } catch (e) {}
  return new Response(JSON.stringify({ ok, ...getState() }), {
    status: ok ? 200 : 400,
  });
}
