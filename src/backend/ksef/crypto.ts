import crypto from "node:crypto";
import { SignedXml } from "xml-crypto"; // npm i xml-crypto

/**
 * Encrypts an arbitrary UTF-8 string with the KSeF system public key using
 * RSAES-OAEP (SHA-256/MGF1), as required by the auth/challenge and
 * batch-session symmetric-key exchange steps.
 */
export function encryptWithKsefPublicKey(
  plainText: string,
  publicKeyDerBase64: string,
): string {
  const der = Buffer.from(publicKeyDerBase64, "base64");
  const publicKey = crypto.createPublicKey({
    key: der,
    format: "der",
    type: "spki",
  });

  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(plainText, "utf8"),
  );

  return encrypted.toString("base64");
}

/**
 * Builds and XAdES-BES-signs the AuthTokenRequest XML used for
 * certificate-based authentication (POST /auth/xades-signature).
 *
 * NOTE: this produces a valid enveloped XML-DSig signature carrying the
 * X.509 certificate, which KSeF's test environment accepts for
 * self-issued/authorization certificates. Strict XAdES-BES (SignedProperties,
 * SigningCertificateV2 etc.) is not fully implemented here — if your
 * certificate requires full XAdES compliance, generate the signature with
 * the Ministry-provided Java/.NET client or a dedicated XAdES library
 * instead of hand-rolling it.
 */
export function buildSignedAuthRequest(params: {
  nip: string;
  challenge: string;
  timestampIso: string;
  certPem: string;
  keyPem: string;
}): string {
  const { nip, challenge, timestampIso, certPem, keyPem } = params;

  const unsignedXml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<AuthTokenRequest xmlns="http://ksef.mf.gov.pl/schema/gtw/svc/online/auth/request/2021/10/01/0001">` +
    `<Context>` +
    `<Challenge>${challenge}</Challenge>` +
    `<Identifier xsi:type="SubjectIdentifierByCompanyType" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">` +
    `<Nip>${nip}</Nip>` +
    `</Identifier>` +
    `<DocumentType><Service>KSeF</Service><Form>XML</Form></DocumentType>` +
    `</Context>` +
    `<Timestamp>${timestampIso}</Timestamp>` +
    `</AuthTokenRequest>`;

  const sig = new SignedXml({
    privateKey: keyPem,
    publicCert: certPem,
    canonicalizationAlgorithm: "http://www.w3.org/2001/10/xml-exc-c14n#",
    signatureAlgorithm: "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256",
  });
  sig.addReference({
    xpath: "//*[local-name(.)='AuthTokenRequest']",
    digestAlgorithm: "http://www.w3.org/2001/04/xmlenc#sha256",
    transforms: [
      "http://www.w3.org/2000/09/xmldsig#enveloped-signature",
      "http://www.w3.org/2001/10/xml-exc-c14n#",
    ],
  });
  sig.computeSignature(unsignedXml, {
    location: {
      reference: "//*[local-name(.)='AuthTokenRequest']",
      action: "append",
    },
  });

  return sig.getSignedXml();
}
