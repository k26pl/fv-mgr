import { test } from "node:test";
import { _getFromNip } from "./vatwl.ts";

test("fetch valid company", async (t) => {
  const data = await _getFromNip("7791011327");
  t.diagnostic(JSON.stringify(data));
  if (!data.ok) {
    throw new Error(`Received error: ${data.error}`);
  }
  t.assert.equal(data.name, "JERONIMO MARTINS POLSKA SPÓŁKA AKCYJNA");
  t.assert.equal(data.accountNumbers[0], "06103015080000000500651008");
  t.assert.equal(data.accountNumbers.length, 70);
});

test("Invalid NIP throws error", async (t) => {
  const d = await _getFromNip("1234");
  t.assert.equal(d.ok, false);
});

test("Removed company throws error", async (t) => {
  const d = await _getFromNip("5252822709");
  t.assert.equal(d.ok, false);
});

// getting coverage of _getFromNip to 100% would require a mock that makes 1st fetch fail
//@TODO: Proper testing of cache
