import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  aggregateByMonth,
  aggregateByTopCategory,
  chartRangeLabels,
  chartViewLabels,
  filterByRange,
  type ChartConfig,
} from "@/lib/finance/charts";
import { formatHUF } from "@/lib/finance/selectors";
import type { FinanceState } from "@/lib/finance/types";

interface ChartResultProps {
  state: FinanceState;
  config: ChartConfig;
}

const sliceColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function ChartResult({ state, config }: ChartResultProps) {
  const inRange = filterByRange(state.transactions, config.range);
  const isCategoryView = config.view !== "balance";
  const slices = isCategoryView
    ? aggregateByTopCategory(state, inRange, config.view as "expense" | "income")
    : [];
  const points = isCategoryView ? [] : aggregateByMonth(inRange);
  const isEmpty = isCategoryView ? slices.length === 0 : points.length === 0;

  const total = isCategoryView
    ? slices.reduce((sum, s) => sum + s.value, 0)
    : points.reduce((sum, p) => sum + p.balance, 0);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">{chartViewLabels[config.view]}</h2>
        <p className="text-sm text-muted-foreground">{chartRangeLabels[config.range]}</p>
      </div>

      {isEmpty ? (
        <p className="text-sm text-muted-foreground">
          No records in this period. Try a wider date range.
        </p>
      ) : (
        <>
          <p className="text-sm">
            <span className="text-muted-foreground">
              {isCategoryView ? "Total" : "Net balance"}:{" "}
            </span>
            <span className="font-semibold">{formatHUF(total)}</span>
          </p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {config.format === "pie" ? (
                <PieChart>
                  <Pie data={slices} dataKey="value" nameKey="label" outerRadius="80%" label>
                    {slices.map((slice, index) => (
                      <Cell key={slice.categoryId} fill={sliceColors[index % sliceColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatHUF(value)} />
                  <Legend />
                </PieChart>
              ) : config.format === "bar" && isCategoryView ? (
                <BarChart data={slices}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} />
                  <YAxis width={70} tickFormatter={(value: number) => formatHUF(value)} />
                  <Tooltip formatter={(value: number) => formatHUF(value)} />
                  <Bar dataKey="value" fill="var(--chart-1)" radius={4} />
                </BarChart>
              ) : config.format === "bar" ? (
                <BarChart data={points}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="monthKey" tickLine={false} />
                  <YAxis width={70} tickFormatter={(value: number) => formatHUF(value)} />
                  <Tooltip formatter={(value: number) => formatHUF(value)} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="var(--chart-2)" radius={4} />
                  <Bar dataKey="expense" name="Expense" fill="var(--chart-4)" radius={4} />
                </BarChart>
              ) : (
                <LineChart data={points}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="monthKey" tickLine={false} />
                  <YAxis width={70} tickFormatter={(value: number) => formatHUF(value)} />
                  <Tooltip formatter={(value: number) => formatHUF(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="balance" name="Balance" stroke="var(--chart-1)" strokeWidth={2} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          {isCategoryView && (
            <ul className="space-y-1 text-sm">
              {slices.map((slice) => (
                <li key={slice.categoryId} className="flex justify-between gap-2">
                  <span>{slice.label}</span>
                  <span className="font-medium">
                    {formatHUF(slice.value)} ({Math.round(slice.share * 100)}%)
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
