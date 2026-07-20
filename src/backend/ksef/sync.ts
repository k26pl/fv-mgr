import { prisma } from "@/backend/db";
import { nip } from "./config";
import { queryInvoiceMetadata, downloadInvoiceXml } from "./queries";
import { parseKsefInvoiceXml } from "./mapper";
import type { InvoiceMetadata, KsefSubject } from "./types";

const KSEF_DOC_TYPE_COST = "FAKTURA_KSEF_KOSZT"; // we are buyer -> zobowiązanie
const KSEF_DOC_TYPE_SALE = "FAKTURA_KSEF_SPRZEDAZ"; // we are seller -> należność

async function ensureSystemDocTypes() {
  await prisma.docType.upsert({
    where: { name: KSEF_DOC_TYPE_COST },
    create: { name: KSEF_DOC_TYPE_COST, is_outgoing: true, is_system: true },
    update: {},
  });
  await prisma.docType.upsert({
    where: { name: KSEF_DOC_TYPE_SALE },
    create: { name: KSEF_DOC_TYPE_SALE, is_outgoing: false, is_system: true },
    update: {},
  });
}

async function upsertCompany(nip: string, name: string, address: string) {
  const nipBig = BigInt(nip);
  await prisma.company.upsert({
    where: { nip: nipBig },
    create: { nip: nipBig, name, adress: address, account_number: [] },
    update: {}, // don't clobber user-edited company data on re-sync
  });
  return nipBig;
}

// In a prod app, this should be persisted to message queue to
// prevent missing invoices in case of server crash/restart
let to_retry: Array<{ ksefNumber: string; subject: KsefSubject }> = [];

/** Imports one invoice (by KSeF number) if we don't already have it. */
async function importInvoiceIfNew(ksefNumber: string, subject: KsefSubject) {
  const existing = await prisma.invoice.findFirst({
    where: { ksef_id: ksefNumber },
  });
  if (existing) return;

  const xml = await downloadInvoiceXml(ksefNumber);

  if (!xml.ok) {
    to_retry.push({ ksefNumber, subject });
    return;
  }

  const parsed = parseKsefInvoiceXml(xml.text);

  const contractor = subject === "received" ? parsed.seller : parsed.buyer;
  const companyNip = await upsertCompany(
    contractor.nip,
    contractor.name,
    contractor.address,
  );

  await prisma.invoice.create({
    data: {
      id: ksefNumber,
      docTypeName:
        subject === "received" ? KSEF_DOC_TYPE_COST : KSEF_DOC_TYPE_SALE,
      date: parsed.date,
      companyNip,
      payment_deadline: parsed.paymentDeadline ?? parsed.date,
      netto_price: parsed.nettoPrice,
      vat: parsed.vat,
      brutto_price: parsed.bruttoPrice,
      account_number: parsed.accountNumber ?? "",
      source: "KSEF",
      ksef_id: ksefNumber,
      accepted: false,
      attachments: {
        create: {
          id: `${ksefNumber}-xml`,
          fileName: `${ksefNumber}.xml`,
          uploadError: false,
          uploadFinished: true,
          dataExtracted: true,
        },
      },
    },
  });
}
export async function retry() {
  let failed = [...to_retry];
  to_retry = [];
  await Promise.all(
    failed.map((e) => importInvoiceIfNew(e.ksefNumber, e.subject)),
  );
  return to_retry.length;
}

async function importRange(dateFrom: Date, dateTo: Date) {
  await ensureSystemDocTypes();

  for (const subject of ["issued", "received"] as const) {
    const rows = await queryInvoiceMetadata({ subject, dateFrom, dateTo });
    for (const row of rows) {
      await importInvoiceIfNew(row.ksefNumber, subject);
    }
  }
}

/**
 * Downloads all invoices (issued & received) that appeared in KSeF since the
 * last successful sync for the configured NIP, then advances the sync
 * watermark. Safe to call on a schedule (e.g. cron every N minutes).
 */
export async function downloadInvoicesSinceLastSync(): Promise<{
  from: Date;
  to: Date;
}> {
  const nipBig = BigInt(nip);
  const state = await prisma.ksefSyncState.findUnique({
    where: { companyNip: nipBig },
  });

  const to = new Date();
  const from = state?.lastSyncedAt ?? new Date(0);

  await importRange(from, to);

  await prisma.ksefSyncState.upsert({
    where: { companyNip: nipBig },
    create: { companyNip: nipBig, lastSyncedAt: to },
    update: { lastSyncedAt: to },
  });

  return { from, to };
}

/**
 * Downloads all invoices (issued & received) whose issue date falls between
 * the given dates (inclusive). Does not touch the sync watermark used by
 * `downloadInvoicesSinceLastSync`.
 */
export async function downloadInvoicesBetweenDates(
  dateFrom: Date,
  dateTo: Date,
): Promise<void> {
  await importRange(dateFrom, dateTo);
}
