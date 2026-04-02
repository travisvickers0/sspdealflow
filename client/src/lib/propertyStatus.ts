export type PropertyDisplayStatus =
  | "AVAILABLE"
  | "COMMITTED"
  | "FUNDED"
  | "SOLD";

export function getPropertyDisplayStatus(
  status: string | null | undefined,
): PropertyDisplayStatus {
  switch (status) {
    case "committed":
      return "COMMITTED";
    case "funded":
    case "archived":
    case "FUNDED":
      return "FUNDED";
    case "SOLD":
      return "SOLD";
    case "needs_funding":
    case "AVAILABLE":
    default:
      return "AVAILABLE";
  }
}

export function getPropertyStatusLabel(
  status: string | null | undefined,
): string {
  const displayStatus = getPropertyDisplayStatus(status);

  switch (displayStatus) {
    case "COMMITTED":
      return "Funding Committed";
    case "FUNDED":
      return "Funded";
    case "SOLD":
      return "Sold";
    case "AVAILABLE":
    default:
      return "Needs Funding";
  }
}
