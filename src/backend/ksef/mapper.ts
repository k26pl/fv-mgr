import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

export interface ParsedKsefInvoice {
  date: Date;
  paymentDeadline: Date | null;
  nettoPrice: number;
  vat: number;
  bruttoPrice: number;
  accountNumber: string | null;
  seller: { nip: string; name: string; address: string };
  buyer: { nip: string; name: string; address: string };
}

function firstOf<T>(v: T | T[] | undefined): T | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function addressOf(podmiot: any): string {
  const adr = podmiot?.Adres;
  if (!adr) return "";
  return [adr.AdresL1, adr.AdresL2].filter(Boolean).join(", ");
}

// Parse a FA(2)/FA(3) invoice into the flat shape
// Invoice/Company models expect
export function parseKsefInvoiceXml(xml: string): ParsedKsefInvoice {
  const doc = parser.parse(xml);
  const faktura = doc.Faktura;
  const fa = faktura.Fa;
  const seller = faktura.Podmiot1;
  const buyer = faktura.Podmiot2;

  const platnosc = fa.Platnosc ?? {};
  const terminPlatnosci = firstOf(platnosc.TerminPlatnosci);
  const rachunek = firstOf(platnosc.RachunekBankowy);

  return {
    date: new Date(fa.P_1),
    paymentDeadline: terminPlatnosci?.Termin
      ? new Date(terminPlatnosci.Termin)
      : null,
    nettoPrice: Number(fa.P_13_1 ?? 0),
    vat: Number(fa.P_14_1 ?? 0),
    bruttoPrice: Number(fa.P_15 ?? 0),
    accountNumber: rachunek?.NrRB ?? null,
    seller: {
      nip: String(seller.DaneIdentyfikacyjne.NIP),
      name: String(seller.DaneIdentyfikacyjne.Nazwa),
      address: addressOf(seller),
    },
    buyer: {
      nip: String(buyer?.DaneIdentyfikacyjne?.NIP ?? ""),
      name: String(buyer?.DaneIdentyfikacyjne?.Nazwa ?? ""),
      address: addressOf(buyer),
    },
  };
}
