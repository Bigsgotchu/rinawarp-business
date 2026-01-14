import type { D1Database } from "https://deno.land/x/wrangler@v3/types.d.ts";

export class LicenseDB {
  constructor(private db: D1Database) {}

  async getLicense(licenseId: string) {
    return await this.db.prepare(
      "SELECT * FROM licenses WHERE id = ?"
    )
      .bind(licenseId)
      .first();
  }

  async createLicense(
    licenseId: string,
    email: string,
    plan: string,
    seats: number = 1,
    status: string = "active",
    stripeCustomerId?: string,
    stripeSubscriptionId?: string
  ) {
    return await this.db.prepare(
      `INSERT INTO licenses (
        id, email, plan, seats, status, stripe_customer_id, stripe_subscription_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        licenseId,
        email,
        plan,
        seats,
        status,
        stripeCustomerId || null,
        stripeSubscriptionId || null
      )
      .run();
  }

  async updateLicenseStatus(licenseId: string, status: string) {
    return await this.db.prepare(
      "UPDATE licenses SET status = ? WHERE id = ?"
    )
      .bind(status, licenseId)
      .run();
  }

  async getSeatCount(licenseId: string) {
    return await this.db.prepare(
      "SELECT COUNT(*) as count FROM license_seats WHERE license_id = ?"
    )
      .bind(licenseId)
      .first();
  }

  async registerSeat(
    licenseId: string,
    userEmail: string,
    seatId: string
  ) {
    return await this.db.prepare(
      "INSERT INTO license_seats (id, license_id, user_email) VALUES (?, ?, ?)"
    )
      .bind(seatId, licenseId, userEmail)
      .run();
  }

  async updateSeatLastSeen(licenseId: string, userEmail: string) {
    return await this.db.prepare(
      "UPDATE license_seats SET last_seen = CURRENT_TIMESTAMP WHERE license_id = ? AND user_email = ?"
    )
      .bind(licenseId, userEmail)
      .run();
  }

  async logUsageEvent(
    licenseId: string,
    eventType: string,
    units: number = 1
  ) {
    return await this.db.prepare(
      "INSERT INTO usage_events (id, license_id, event_type, units) VALUES (?, ?, ?, ?)"
    )
      .bind(crypto.randomUUID(), licenseId, eventType, units)
      .run();
  }

  async getMonthlyUsage(licenseId: string) {
    return await this.db.prepare(
      "SELECT COUNT(*) as count FROM usage_events WHERE license_id = ? AND created_at >= date('now', '-30 day')"
    )
      .bind(licenseId)
      .first();
  }

  async createInvoice(
    invoiceId: string,
    licenseId: string,
    amount: number,
    status: string,
    dueDate?: string,
    stripeInvoiceId?: string
  ) {
    return await this.db.prepare(
      `INSERT INTO invoices (
        id, license_id, amount, status, due_date, stripe_invoice_id
      ) VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(
        invoiceId,
        licenseId,
        amount,
        status,
        dueDate || null,
        stripeInvoiceId || null
      )
      .run();
  }

  async getActiveLicenses() {
    return await this.db.prepare(
      "SELECT * FROM licenses WHERE status = 'active'"
    )
      .all();
  }

  async getLicenseByStripeCustomer(customerId: string) {
    return await this.db.prepare(
      "SELECT * FROM licenses WHERE stripe_customer_id = ?"
    )
      .bind(customerId)
      .first();
  }
}