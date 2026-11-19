import { useState } from "react";
import { addDays, differenceInCalendarDays } from "date-fns";
import { BarChart3, ChartPie, ArrowDownLeft, ArrowUpRight, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ChartDatePicker } from "./ChartDatePicker";
import { ChartCategoryFilters } from "./ChartCategoryFilters";
import { ChartResult } from "./ChartResult";
import {
  chartViewLabels,
  parseChartDate,
  previousMonths,
  recentSliderBounds,
  type ChartFormat,
  type ChartPeriod,
  type ChartView,
} from "@/lib/finance/charts";
import { toIsoDate } from "@/lib/dates";
import type { FinanceState } from "@/lib/finance/types";

export function ChartExplorer({ state }: { state: FinanceState }) {
  const [view, setView] = useState<ChartView | null>(null);
  const [period, setPeriod] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null,
  });
  const [format, setFormat] = useState<ChartFormat>("bar");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [shortcut, setShortcut] = useState<number | null>(null);
  const [recent] = useState(() => recentSliderBounds());
  const sliderStart = parseChartDate(recent.start);
  const max = differenceInCalendarDays(parseChartDate(recent.end), sliderStart);
  const startOffset = period.start
    ? differenceInCalendarDays(parseChartDate(period.start), sliderStart)
    : 0;
  const endOffset = period.end
    ? differenceInCalendarDays(parseChartDate(period.end), sliderStart)
    : max;
  const sliderOutside = startOffset < 0 || endOffset > max;
  const sliderValue = [
    Math.max(0, Math.min(max, startOffset)),
    Math.max(0, Math.min(max, endOffset)),
  ];
  const invalid = Boolean(period.start && period.end && period.start > period.end);
  const config =
    view && period.start && period.end && !invalid
      ? { view, start: period.start, end: period.end, format, categoryId }
      : null;
  const icons = { expense: ArrowDownLeft, balance: Scale, income: ArrowUpRight };
  function chooseView(nextView: ChartView) {
    setView(nextView);
    setCategoryId(null);
  }
  function updatePeriod(nextPeriod: ChartPeriod) {
    setPeriod(nextPeriod);
    setShortcut(null);
  }
  return (
    <div className="space-y-6">
      <section aria-label="Chart filters" className="space-y-6">
        <div role="group" aria-label="Money view" className="grid grid-cols-3 gap-2">
          {(["expense", "balance", "income"] as const).map((option) => {
            const Icon = icons[option];
            return (
              <Button
                key={option}
                variant={view === option ? "default" : "outline"}
                aria-pressed={view === option}
                className="h-12 gap-1.5 px-2"
                onClick={() => chooseView(option)}
              >
                <Icon aria-hidden="true" />
                {chartViewLabels[option]}
              </Button>
            );
          })}
        </div>
        <div className="space-y-4">
          <h2 className="text-sm font-semibold">Time range</h2>
          <div className="grid grid-cols-2 gap-3">
            <ChartDatePicker
              label="From date"
              value={period.start}
              disabled={!view}
              onChange={(start) => {
                setPeriod({ ...period, start });
                setShortcut(null);
              }}
            />
            <ChartDatePicker
              label="To date"
              value={period.end}
              disabled={!view}
              onChange={(end) => {
                setPeriod({ ...period, end });
                setShortcut(null);
              }}
            />
          </div>
          {invalid && (
            <p role="alert" className="text-sm text-destructive">
              From date must be on or before To date.
            </p>
          )}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Last 2 months</span>
              {sliderOutside && <span>Custom range</span>}
            </div>
            <Slider
              disabled={!view}
              value={sliderValue}
              min={0}
              max={max}
              step={1}
              onValueChange={(values) => {
                const [start, end] = values;
                if (start !== undefined && end !== undefined)
                  updatePeriod({
                    start: toIsoDate(addDays(sliderStart, start)),
                    end: toIsoDate(addDays(sliderStart, end)),
                  });
              }}
            />
            <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
              <span>{recent.start}</span>
              <span>{recent.end}</span>
            </div>
          </div>
          <div role="group" aria-label="Quick periods" className="grid grid-cols-3 gap-2">
            {([1, 3, 6] as const).map((months) => (
              <Button
                key={months}
                disabled={!view}
                variant={shortcut === months ? "secondary" : "outline"}
                aria-pressed={shortcut === months}
                className="h-auto min-h-9 whitespace-normal px-2 text-xs"
                onClick={() => {
                  setPeriod(previousMonths(months));
                  setShortcut(months);
                }}
              >
                {months === 1 ? "Last month" : `Last ${months} months`}
              </Button>
            ))}
          </div>
        </div>
        <div role="group" aria-label="Chart format" className="flex gap-2">
          <Button
            disabled={!view}
            variant={format === "bar" ? "secondary" : "ghost"}
            aria-pressed={format === "bar"}
            onClick={() => setFormat("bar")}
          >
            <BarChart3 aria-hidden="true" />
            Bar chart
          </Button>
          <Button
            disabled={!view}
            variant={format === "pie" ? "secondary" : "ghost"}
            aria-pressed={format === "pie"}
            onClick={() => setFormat("pie")}
          >
            <ChartPie aria-hidden="true" />
            Pie chart
          </Button>
        </div>
      </section>
      <div className="space-y-6 border-t border-border pt-6">
        {view && (
          <ChartCategoryFilters state={state} categoryId={categoryId} onChange={setCategoryId} />
        )}
        {config && <ChartResult state={state} config={config} onCategoryChange={setCategoryId} />}
      </div>
    </div>
  );
}
