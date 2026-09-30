export interface Transaction {
  id: string;
  merchant_id: string;
  amount: number;
  timestamp: string;
  raw_payload?: Record<string, unknown> | null;
  risk_score?: number | null;
  risk_band?: string | null;
  explanation?: string | null;
}