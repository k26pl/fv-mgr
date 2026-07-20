import { readFile } from "node:fs/promises";

export const cert = await readFile("./ksef.crt", { encoding: "utf8" });
export const key = await readFile("./ksef.key", { encoding: "utf8" });
export const pw = process.env.KSEF_CERT_PW!;
export const baseUrl = "https://ksef-test.mf.gov.pl/api/v2";
export const nip = process.env.NIP!;
