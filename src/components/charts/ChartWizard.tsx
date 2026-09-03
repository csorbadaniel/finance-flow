import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  chartFormatLabels,
  chartRangeLabels,
  chartViewLabels,
  defaultChartConfig,
  type ChartConfig,
  type ChartFormat,
  type ChartRange,
  type ChartView,
} from "@/lib/finance/charts";

interface ChartWizardProps {
  onComplete: (config: ChartConfig) => void;
  initialConfig?: ChartConfig;
}

const totalSteps = 3;

export function ChartWizard({ onComplete, initialConfig }: ChartWizardProps) {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<ChartConfig>(initialConfig ?? defaultChartConfig);

  // Line only makes sense for a time series, not for category breakdowns.
  const formats: ChartFormat[] = config.view === "balance" ? ["bar", "line"] : ["pie", "bar"];
  const isLastStep = step === totalSteps;

  function next() {
    if (!isLastStep) {
      setStep(step + 1);
      return;
    }
    const format = formats.includes(config.format) ? config.format : formats[0];
    onComplete({ ...config, format });
  }

  return (
    <div className="space-y-6">
      <p className="text-sm font-medium text-muted-foreground">
        Step {step} of {totalSteps}
      </p>

      {step === 1 && (
        <fieldset className="space-y-3">
          <legend className="mb-3 text-base font-semibold">What do you want to see?</legend>
          <RadioGroup
            value={config.view}
            onValueChange={(value) => setConfig({ ...config, view: value as ChartView })}
            className="space-y-2"
          >
            {(Object.keys(chartViewLabels) as ChartView[]).map((view) => (
              <div key={view} className="flex items-center gap-3">
                <RadioGroupItem value={view} id={`view-${view}`} />
                <Label htmlFor={`view-${view}`}>{chartViewLabels[view]}</Label>
              </div>
            ))}
          </RadioGroup>
        </fieldset>
      )}

      {step === 2 && (
        <fieldset className="space-y-3">
          <legend className="mb-3 text-base font-semibold">Which period?</legend>
          <RadioGroup
            value={config.range}
            onValueChange={(value) => setConfig({ ...config, range: value as ChartRange })}
            className="space-y-2"
          >
            {(Object.keys(chartRangeLabels) as ChartRange[]).map((range) => (
              <div key={range} className="flex items-center gap-3">
                <RadioGroupItem value={range} id={`range-${range}`} />
                <Label htmlFor={`range-${range}`}>{chartRangeLabels[range]}</Label>
              </div>
            ))}
          </RadioGroup>
        </fieldset>
      )}

      {step === 3 && (
        <fieldset className="space-y-3">
          <legend className="mb-3 text-base font-semibold">How should it look?</legend>
          <RadioGroup
            value={formats.includes(config.format) ? config.format : formats[0]}
            onValueChange={(value) => setConfig({ ...config, format: value as ChartFormat })}
            className="space-y-2"
          >
            {formats.map((format) => (
              <div key={format} className="flex items-center gap-3">
                <RadioGroupItem value={format} id={`format-${format}`} />
                <Label htmlFor={`format-${format}`}>{chartFormatLabels[format]}</Label>
              </div>
            ))}
          </RadioGroup>
        </fieldset>
      )}

      <div className="flex justify-between gap-2">
        <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 1}>
          Back
        </Button>
        <Button onClick={next}>{isLastStep ? "Show chart" : "Next"}</Button>
      </div>
    </div>
  );
}
