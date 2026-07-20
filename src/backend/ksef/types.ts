import { z } from "zod";

export const PublicKeyCertificateSchema = z.object({
  // base64 DER
  certificate: z.string(),
  validFrom: z.string(),
  validTo: z.string(),
});
export type PublicKeyCertificate = z.infer<typeof PublicKeyCertificateSchema>;

export const AuthChallengeSchema = z.object({
  challenge: z.string(),
  // ISO 8601
  timestamp: z.string(),
});
export type AuthChallenge = z.infer<typeof AuthChallengeSchema>;

export const AuthInitResponseSchema = z.object({
  referenceNumber: z.string(),
  authenticationToken: z.object({
    token: z.string(),
  }),
});
export type AuthInitResponse = z.infer<typeof AuthInitResponseSchema>;

export const AuthStatusSchema = z.object({
  status: z.object({
    code: z.number(),
    description: z.string(),
  }),
});
export type AuthStatus = z.infer<typeof AuthStatusSchema>;

export const TokenPairSchema = z.object({
  accessToken: z.object({ token: z.string(), validUntil: z.string() }),
  refreshToken: z.object({ token: z.string(), validUntil: z.string() }),
});
export type TokenPair = z.infer<typeof TokenPairSchema>;

// One row of /invoices/query/metadata results. KSeF returns more fields;
// we only declare the ones we actually map onto Invoice.
export const InvoiceMetadataSchema = z.object({
  ksefNumber: z.string(),
  invoiceNumber: z.string(),
  issueDate: z.string(),
  invoicingMode: z.string().optional(),
  seller: z.object({
    nip: z.string(),
    name: z.string().optional(),
  }),
  buyer: z.object({
    nip: z.string().optional(),
    name: z.string().optional(),
  }),
  netAmount: z.number().optional(),
  vatAmount: z.number().optional(),
  grossAmount: z.number().optional(),
  currency: z.string().optional(),
});
export type InvoiceMetadata = z.infer<typeof InvoiceMetadataSchema>;

export const InvoiceMetadataQueryResultSchema = z.object({
  invoices: z.array(InvoiceMetadataSchema),
  hasMore: z.boolean().optional(),
  continuationToken: z.string().optional(),
});
export type InvoiceMetadataQueryResult = z.infer<
  typeof InvoiceMetadataQueryResultSchema
>;

// Which side of the invoice the authenticated NIP is on.
export type KsefSubject = "issued" | "received";
