import type { Transaction } from "../api/types";
import RiskBadge from "./RiskBadge";

interface TransactionTableProps {
  transactions: Transaction[];
}

export default function TransactionTable({
  transactions,
}: TransactionTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full text-left">
        <thead className="bg-slate-900">
          <tr>
            <th className="px-6 py-4">Transaction</th>
            <th className="px-6 py-4">Merchant</th>
            <th className="px-6 py-4">Amount</th>
            <th className="px-6 py-4">Risk</th>
            <th className="px-6 py-4">Score</th>
            <th className="px-6 py-4">Time</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((transaction) => (
            <tr
              key={transaction.id}
              className="border-t border-slate-800 hover:bg-slate-900/50"
            >
              <td className="px-6 py-4 text-sm text-slate-400">
                {transaction.id.slice(0, 8)}...
              </td>

              <td className="px-6 py-4">
                {transaction.merchant_id}
              </td>

              <td className="px-6 py-4 font-medium">
                ₹{transaction.amount.toLocaleString("en-IN")}
              </td>

              <td className="px-6 py-4">
                <RiskBadge risk={transaction.risk_band} />
              </td>

              <td className="px-6 py-4">
                {transaction.risk_score !== null &&
                transaction.risk_score !== undefined
                  ? `${(transaction.risk_score * 100).toFixed(0)}%`
                  : "—"}
              </td>

              <td className="px-6 py-4 text-sm text-slate-400">
                {new Date(transaction.timestamp).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}