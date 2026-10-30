import { initialFinanceState as emptyState } from "@/lib/finance/initialState";
import { demoTransactions } from "@/lib/demo/sampleRecords";

/** Sample starting data for tests only. */
export const initialFinanceState = { ...emptyState, transactions: demoTransactions };
