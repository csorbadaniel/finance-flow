import { useState } from "react";
import {
  Bar,
  ComposedChart,
  Line,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  aggregateByDay,
  chartSlices,
  chartViewLabels,
  filterChartTransactions,
  sortChronologically,
  type ChartConfig,
} from "@/lib/finance/charts";
import { sumByType } from "@/lib/finance/selectors";
import { useMoneyFormatter } from "@/lib/finance/useFinance";
import type { FinanceState } from "@/lib/finance/types";
import { ChartRecordList } from "./ChartRecordList";
interface Props {
  state: FinanceState;
  config: ChartConfig;
  onCategoryChange: (id: string | null) => void;
}
const colors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];
export function ChartResult({ state, config, onCategoryChange }: Props) {
  const money = useMoneyFormatter();
  const [showRunningTotal, setShowRunningTotal] = useState(false);
  const transactions = filterChartTransactions(state, config);
  const totals = sumByType(transactions);
  const isBalance = config.view === "balance";
  const total = isBalance ? totals.balance : totals[config.view];
  const slices = chartSlices(state, transactions, config.view, config.categoryId);
  const points =
    config.format === "bar" ? aggregateByDay(transactions, config.start, config.end) : [];
  function drill(id: string) {
    onCategoryChange(id);
  }
  return (
    <section aria-label="Chart result" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">
            {isBalance ? "Net balance" : chartViewLabels[config.view]}
          </h2>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{money(total)}</p>
        </div>
        <p className="text-xs text-muted-foreground tabular-nums">
          {config.start} — {config.end}
        </p>
      </div>
      {(config.format === "pie" ? !slices.length : !transactions.length) ? (
        <div className="flex h-64 items-center justify-center border-y border-dashed text-sm text-muted-foreground">
          {config.format === "pie" && isBalance
            ? "No expense records in this period."
            : "No records in this period."}
        </div>
      ) : (
        <>
          <div
            className="h-80 w-full min-w-0"
            role="img"
            aria-label={
              config.format === "bar"
                ? `${chartViewLabels[config.view]} by day`
                : `${chartViewLabels[config.view]} breakdown`
            }
          >
            <ResponsiveContainer width="100%" height="100%">
              {config.format === "pie" ? (
                <PieChart>
                  <Pie
                    data={slices}
                    dataKey="value"
                    nameKey="label"
                    outerRadius="85%"
                    paddingAngle={2}
                    stroke="var(--background)"
                    onClick={(_, index) => {
                      const slice = slices[index];
                      if (slice) drill(slice.categoryId);
                    }}
                    className="cursor-pointer"
                  >
                    {slices.map((slice, index) => (
                      <Cell key={slice.categoryId} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => money(value)}
                    contentStyle={{
                      background: "var(--popover)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                      borderRadius: "var(--radius)",
                    }}
                    itemStyle={{ color: "var(--foreground)" }}
                  />
                </PieChart>
              ) : (
                <ComposedChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 22 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    minTickGap={36}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  />
                  <YAxis
                    width={76}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => money(Number(value))}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  />
                  <ReferenceLine y={0} stroke="var(--border)" />
                  <Tooltip
                    formatter={(value: number) => money(value)}
                    cursor={{ fill: "var(--accent)" }}
                    contentStyle={{
                      background: "var(--popover)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                    itemStyle={{ color: "var(--foreground)" }}
                  />
                  <Bar
                    dataKey={config.view}
                    name={isBalance ? "Net balance" : chartViewLabels[config.view]}
                    fill="var(--chart-1)"
                    maxBarSize={32}
                    radius={[2, 2, 0, 0]}
                  />
                  {isBalance && showRunningTotal && (
                    <Line
                      type="monotone"
                      dataKey="cumulative"
                      name="Running total"
                      stroke="var(--foreground)"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  )}
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
          {isBalance && config.format === "bar" && (
            <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={showRunningTotal}
                onChange={(event) => setShowRunningTotal(event.target.checked)}
              />
              Show running total line
            </label>
          )}
          {config.format === "pie" && (
            <ul className="divide-y divide-border">
              {slices.map((slice, index) => (
                <li key={slice.categoryId}>
                  <Button
                    variant="ghost"
                    className="h-auto min-h-11 w-full justify-between gap-3 px-0 py-3 text-left"
                    onClick={() => drill(slice.categoryId)}
                    aria-label={`Zoom into ${slice.label}`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className={`size-2 shrink-0 rounded-sm ${["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"][index % 5]}`}
                      />
                      <span className="whitespace-normal">{slice.label}</span>
                    </span>
                    <span className="shrink-0 text-xs tabular-nums">
                      {money(slice.value)} · {Math.round(slice.share * 100)}%
                    </span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {!isBalance && config.categoryId && (
        <ChartRecordList state={state} transactions={sortChronologically(transactions)} />
      )}
    </section>
  );
}
