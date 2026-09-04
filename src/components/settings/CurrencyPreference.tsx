import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES, formatMoney, type CurrencyCode } from "@/lib/finance/currency";
import { financeStore, useFinance } from "@/lib/finance/useFinance";

const PREVIEW_AMOUNT = 1234.5;

/** Currency picker; the choice is a display preference used across the app. */
export function CurrencyPreference() {
  const { currency } = useFinance();

  const handleChange = (value: string) => {
    const code = value as CurrencyCode;
    financeStore.setCurrency(code);
    toast.success(`Currency set to ${code}`);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="settings-currency">Currency</Label>
      <Select value={currency} onValueChange={handleChange}>
        <SelectTrigger id="settings-currency" aria-label="Currency">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CURRENCIES.map((option) => (
            <SelectItem key={option.code} value={option.code}>
              {option.code} — {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Balances are shown as {formatMoney(PREVIEW_AMOUNT, currency)}. Amounts are never converted.
      </p>
    </div>
  );
}
