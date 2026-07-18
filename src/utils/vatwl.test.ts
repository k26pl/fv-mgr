import { test } from "node:test";
import { _getFromNip } from "./vatwl.ts";

test("fetch valid company", async (t) => {
  let data = await _getFromNip("5342491417");
  t.diagnostic(JSON.stringify(data));
  if (!data.ok) {
    throw new Error(`Received error: ${data.error}`);
  }
  t.assert.equal(data.name, "KOMAN.AI SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ");
  t.assert.equal(data.accountNumbers[0], "38253000082090107933110001");
  t.assert.equal(data.accountNumbers.length, 1);
});

test("Invalid NIP throws error", async (t) => {
  let d = await _getFromNip("1234");
  t.assert.equal(d.ok, false);
});

test("Removed company throws error", async (t) => {
  let d = await _getFromNip("5252822709");
  t.assert.equal(d.ok, false);
});

// getting coverage of _getFromNip to 100% would require a mock that makes 1st fetch fail
//@TODO: Proper testing of cache
