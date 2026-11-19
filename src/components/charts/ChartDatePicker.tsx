import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { parseChartDate } from "@/lib/finance/charts";
import { toIsoDate } from "@/lib/dates";

interface ChartDatePickerProps {
  label: string;
  value: string | null;
  disabled: boolean;
  onChange: (value: string) => void;
}
export function ChartDatePicker({ label, value, disabled, onChange }: ChartDatePickerProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-w-0 space-y-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            aria-label={label}
            className="w-full justify-between px-3 font-normal"
          >
            <span>{value ?? "YYYY-MM-DD"}</span>
            <CalendarIcon aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0 pointer-events-auto">
          <Calendar
            mode="single"
            selected={value ? parseChartDate(value) : undefined}
            defaultMonth={value ? parseChartDate(value) : undefined}
            captionLayout="dropdown"
            startMonth={new Date(1900, 0)}
            endMonth={new Date(2100, 11)}
            onSelect={(date) => {
              if (date) {
                onChange(toIsoDate(date));
                setOpen(false);
              }
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
