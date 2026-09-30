interface RiskBadgeProps {
  risk: string | null | undefined;
}

export default function RiskBadge({ risk }: RiskBadgeProps) {
  const normalizedRisk = risk?.toLowerCase();

  let classes =
    "inline-flex rounded-full px-3 py-1 text-xs font-semibold";

  if (normalizedRisk === "fraud") {
    classes += " bg-red-500/20 text-red-400";
  } else if (normalizedRisk === "suspicious") {
    classes += " bg-yellow-500/20 text-yellow-400";
  } else {
    classes += " bg-green-500/20 text-green-400";
  }

  return (
    <span className={classes}>
      {risk ?? "unknown"}
    </span>
  );
}