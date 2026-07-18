import { cachedGetFromNip } from "@/utils/vatwl";

export async function GET(req: Request, ctx: RouteContext<"/api/nip/[nip]">) {
  let { nip } = await ctx.params;
  let data = await cachedGetFromNip(nip);
  return new Response(JSON.stringify(data), {
    status: data.ok ? 200 : 400,
  });
}
