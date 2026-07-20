import { getAccessToken } from "./auth";
import { baseUrl } from "./config";
import {
  InvoiceMetadataQueryResultSchema,
  type InvoiceMetadata,
  type KsefSubject,
} from "./types";

async function authedFetch(url: string, init?: RequestInit): Promise<Response> {
  const token = await getAccessToken();
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`KSeF request failed ${res.status} ${url}: ${body}`);
  }
  return res;
}

// Queries invoice metadata for a date range. `subject` selects whether we
// pull invoices where our NIP is the seller ("issued") or the buyer
// ("received").
// Handles pagination via continuationToken.
export async function queryInvoiceMetadata(params: {
  subject: KsefSubject;
  dateFrom: Date;
  dateTo: Date;
}): Promise<InvoiceMetadata[]> {
  const { subject, dateFrom, dateTo } = params;
  const results: InvoiceMetadata[] = [];
  let continuationToken: string | undefined;

  do {
    const res = await authedFetch(`${baseUrl}/invoices/query/metadata`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(continuationToken
          ? { "x-continuation-token": continuationToken }
          : {}),
      },
      body: JSON.stringify({
        subjectType: subject === "issued" ? "subject1" : "subject2",
        dateRange: {
          dateType: "Issue",
          from: dateFrom.toISOString(),
          to: dateTo.toISOString(),
        },
      }),
    });

    const parsed = InvoiceMetadataQueryResultSchema.parse(await res.json());
    results.push(...parsed.invoices);
    continuationToken = parsed.hasMore ? parsed.continuationToken : undefined;
  } while (continuationToken);

  return results;
}

// Downloads the raw FA(3)/FA(2) invoice XML for a given KSeF number.
export async function downloadInvoiceXml(
  ksefNumber: string,
): Promise<{ ok: true; text: string } | { ok: false; err: string }> {
  try {
    const res = await authedFetch(`${baseUrl}/invoices/ksef/${ksefNumber}`);
    return { text: await res.text(), ok: true };
  } catch (e) {
    console.error("Cannot download invoice from KSEF", e);
    return {
      ok: false,
      err: "Nie udało się pobrać faktury z KSEF",
    };
  }
}
