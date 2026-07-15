import { getUploadLink, getDownloadLink } from "./b2.ts";
import { test } from "node:test";

test("b2 upload and download", async (t) => {
  const { id, link } = await getUploadLink();
  const body = crypto.randomUUID() + crypto.randomUUID();
  const headers = new Headers();
  headers.set("Content-Type", "application/pdf");
  const res = await fetch(link, {
    method: "PUT",
    body,
  });
  t.assert.equal(res.ok, true);
  t.assert.equal(res.status, 200);
  const get_url = await getDownloadLink(id);
  const get_res = await fetch(get_url);
  t.assert.equal(get_res.ok,true);
  const received_body = await get_res.text();
  t.assert.equal(body, received_body);
});
