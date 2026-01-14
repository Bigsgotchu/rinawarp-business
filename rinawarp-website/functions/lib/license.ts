export function generateLicense(email: string) {
  const raw = `${email}:${crypto.randomUUID()}`;
  return Buffer.from(raw).toString("base64url");
}