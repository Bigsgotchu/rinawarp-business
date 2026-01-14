import type { D1Database } from "https://deno.land/x/wrangler@v3/types.d.ts";
import { LicenseDB } from "./db";

export async function validateLicense(
  authHeader?: string,
  db?: D1Database,
  userEmail?: string
) {
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const [email] = decoded.split(":");
    
    if (!email) return null;

    // If we have a database, validate the license
    if (db) {
      const licenseDb = new LicenseDB(db);
      const license = await licenseDb.getLicense(token);
      
      if (!license) return null;
      
      // Check license status
      if (license.status !== "active") {
        return null;
      }

      // Check seat limits if userEmail is provided
      if (userEmail && license.seats > 1) {
        const seats = await licenseDb.getSeatCount(token);
        
        if (seats.count >= license.seats) {
          return { error: "Seat limit exceeded" };
        }
        
        // Register or update seat
        await licenseDb.registerSeat(token, userEmail, crypto.randomUUID());
        await licenseDb.updateSeatLastSeen(token, userEmail);
      }

      // Log usage event
      await licenseDb.logUsageEvent(token, "api_call");

      return {
        email: license.email,
        plan: license.plan,
        seats: license.seats,
        licenseId: token
      };
    }

    return email;
  } catch {
    return null;
  }
}