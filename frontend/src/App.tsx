import { useAlerts } from "./useAlerts";
import RiskBadge from "../../components/RiskBadge";

export function AlertCenter() {
  const {
    data: alerts,
    isLoading,
    isError,
  } = useAlerts();

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">
          Alert Center
        </h2>

        <p className="mt-2 text-slate-400">
          Review transactions flagged by CyberShield.
        </p>
      </div>

      {isLoading && (
        <p className="text-slate-400">
          Loading alerts...
        </p>
      )}

      {isError && (
        <p className="text-red-400">
          Failed to load alerts.
        </p>
      )}

      {!isLoading && !isError && (
        <div className="space-y-4">
          {alerts && alerts.length > 0 ? (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-xl border border-slate-800 bg-slate-900 p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">
                      Transaction {alert.id.slice(0, 8)}...
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Merchant: {alert.merchant_id}
                    </p>
                  </div>

                  <RiskBadge risk={alert.risk_band} />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">
                      Amount
                    </p>

                    <p className="mt-1 font-semibold text-white">
                      ₹{alert.amount.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Risk Score
                    </p>

                    <p className="mt-1 font-semibold text-white">
                      {alert.risk_score !== null &&
                      alert.risk_score !== undefined
                        ? `${(alert.risk_score * 100).toFixed(0)}%`
                        : "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Time
                    </p>

                    <p className="mt-1 text-sm text-slate-300">
                      {new Date(
                        alert.timestamp
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>

                {alert.explanation && (
                  <div className="mt-4 rounded-lg bg-slate-950 p-4">
                    <p className="text-xs font-semibold text-slate-500">
                      WHY FLAGGED
                    </p>

                    <p className="mt-1 text-sm text-slate-300">
                      {alert.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
              <p className="text-slate-400">
                No active alerts.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}