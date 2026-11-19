import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCategoryPath } from "@/lib/finance/selectors";
import type { FinanceState } from "@/lib/finance/types";
interface Props {
  state: FinanceState;
  categoryId: string | null;
  onChange: (id: string | null) => void;
}
export function ChartCategoryFilters({ state, categoryId, onChange }: Props) {
  const path = categoryId ? getCategoryPath(state, categoryId) : [];
  const parents = [null, ...path.map((category) => category.id)];
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {parents.map((parentId, depth) => {
          const children = state.categories.filter((category) => category.parentId === parentId);
          if (!children.length) return null;
          const label =
            depth === 0 ? "Category" : depth === 1 ? "Subcategory" : "Further subcategory";
          return (
            <div key={parentId ?? "root"} className="min-w-0 space-y-2">
              <Label htmlFor={`chart-category-${depth}`}>{label}</Label>
              <Select
                value={path[depth]?.id ?? "all"}
                onValueChange={(value) => onChange(value === "all" ? parentId : value)}
              >
                <SelectTrigger id={`chart-category-${depth}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {depth === 0 ? "All categories" : "All subcategories"}
                  </SelectItem>
                  {children.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        })}
      </div>
      {path.length > 0 && (
        <nav aria-label="Chart category path" className="flex flex-wrap items-center gap-1 text-sm">
          <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
            All categories
          </Button>
          {path.map((category) => (
            <span key={category.id} className="flex items-center">
              <ChevronRight aria-hidden="true" className="size-3 text-muted-foreground" />
              <Button variant="ghost" size="sm" onClick={() => onChange(category.id)}>
                {category.name}
              </Button>
            </span>
          ))}
        </nav>
      )}
    </div>
  );
}
