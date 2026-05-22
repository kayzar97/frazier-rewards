export function calculateTrustScore({
  claims = [],
  fraudFlags = [],
  securityLogs = [],
}: {
  claims?: any[];
  fraudFlags?: any[];
  securityLogs?: any[];
}) {
  let score = 100;

  const deniedClaims = claims.filter((claim) => claim.status === "denied");
  const sentClaims = claims.filter((claim) => claim.status === "sent");

  score -= fraudFlags.length * 20;
  score -= deniedClaims.length * 15;

  const criticalFlags = fraudFlags.filter(
    (flag) => flag.severity === "critical"
  );

  score -= criticalFlags.length * 20;

  if (securityLogs.length > 20) {
    score -= 15;
  }

  score += Math.min(sentClaims.length * 5, 15);

  score = Math.max(0, Math.min(100, score));

  let label = "Trusted";
  let color = "text-emerald-300";

  if (score < 70) {
    label = "Medium Risk";
    color = "text-yellow-300";
  }

  if (score < 40) {
    label = "High Risk";
    color = "text-red-300";
  }

  return {
    score,
    label,
    color,
  };
}