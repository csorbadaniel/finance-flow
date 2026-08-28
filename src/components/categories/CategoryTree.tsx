import { ChevronDown, ChevronRight, Pencil, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { Category, FinanceState } from "@/lib/finance/types";

interface CategoryTreeProps {
  state: FinanceState;
  onAddChild: (parent: Category) => void;
  onEdit: (category: Category) => void;
}

function getChildren(state: FinanceState, parentId: string | null): Category[] {
  return state.categories
    .filter((c) => c.parentId === parentId)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function countRecords(state: FinanceState, categoryId: string): number {
  return state.transactions.filter((t) => t.categoryId === categoryId).length;
}

interface CategoryNodeProps extends CategoryTreeProps {
  category: Category;
}

function CategoryNode({ category, state, onAddChild, onEdit }: CategoryNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const children = getChildren(state, category.id);
  const recordCount = countRecords(state, category.id);

  return (
    <li>
      <div className="flex items-center gap-1 rounded-md py-1">
        {children.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            aria-label={isExpanded ? `Collapse ${category.name}` : `Expand ${category.name}`}
            aria-expanded={isExpanded}
            onClick={() => setIsExpanded((v) => !v)}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        ) : (
          <span className="h-7 w-7 shrink-0" aria-hidden="true" />
        )}

        <span className="min-w-0 flex-1 truncate text-sm font-medium">{category.name}</span>

        {recordCount > 0 && (
          <span className="shrink-0 text-xs text-muted-foreground">{recordCount} records</span>
        )}

        {category.level < 3 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            aria-label={`Add subcategory to ${category.name}`}
            onClick={() => onAddChild(category)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          aria-label={`Edit ${category.name}`}
          onClick={() => onEdit(category)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>

      {isExpanded && children.length > 0 && (
        <ul className="ml-4 border-l pl-2">
          {children.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              state={state}
              onAddChild={onAddChild}
              onEdit={onEdit}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function CategoryTree({ state, onAddChild, onEdit }: CategoryTreeProps) {
  const roots = getChildren(state, null);

  if (roots.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No categories yet. Add your first one to start organizing records.
      </p>
    );
  }

  return (
    <ul aria-label="Category tree">
      {roots.map((root) => (
        <CategoryNode
          key={root.id}
          category={root}
          state={state}
          onAddChild={onAddChild}
          onEdit={onEdit}
        />
      ))}
    </ul>
  );
}
