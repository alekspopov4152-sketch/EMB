import crypto from "crypto";

export function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function generateToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

export function generateBookingCode(sequence: number) {
  const year = new Date().getUTCFullYear();
  return `CAI-${year}-${String(sequence).padStart(6, "0")}`;
}
