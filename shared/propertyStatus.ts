/**
 * Shared property-status helpers used by both client UI and server deal alerts.
 *
 * Historical note: older rows may still use "AVAILABLE" / "FUNDED", while the
 * admin form writes "needs_funding" / "funded". Treat both spellings as the
 * same funding state when deciding whether a deal alert can go out.
 */

export function isDealAlertEligible(status: string | null | undefined): boolean {
  return status === "AVAILABLE" || status === "needs_funding";
}
