import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exampleBackup, parseBackup, toCsv, toJson } from "@/lib/finance/backup";
import { financeStore, useFinance } from "@/lib/finance/useFinance";

/** Triggers a client-side file download. */
function downloadFile(fileName: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Export and import of all records, categories and purses as CSV or JSON. */
export function DataTransfer() {
  const state = useFinance();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const data = {
    categories: state.categories,
    purses: state.purses,
    transactions: state.transactions,
    currency: state.currency,
  };

  const handleExport = (format: "json" | "csv") => {
    try {
      if (format === "json") {
        downloadFile(`financeflow-export-${today()}.json`, toJson(data), "application/json");
      } else {
        downloadFile(`financeflow-export-${today()}.csv`, toCsv(data), "text/csv");
      }
      toast.success(`Export ready as ${format.toUpperCase()}`);
    } catch {
      toast.error("Export failed. Please try again.");
    }
  };

  const handleExample = (format: "json" | "csv") => {
    if (format === "json") {
      downloadFile("financeflow-example.json", toJson(exampleBackup), "application/json");
    } else {
      downloadFile("financeflow-example.csv", toCsv(exampleBackup), "text/csv");
    }
    toast.success(`Example ${format.toUpperCase()} downloaded`);
  };

  const handleFile = async (file: File) => {
    setIsImporting(true);
    try {
      const text = await file.text();
      const parsed = parseBackup(text, file.name);
      financeStore.replaceData(parsed);
      toast.success(`Imported ${parsed.transactions.length} records`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed.");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex-1 min-w-[9rem]">
              Export data
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={() => handleExport("csv")}>Download CSV</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleExport("json")}>Download JSON</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          className="flex-1 min-w-[9rem]"
          disabled={isImporting}
          onClick={() => fileInputRef.current?.click()}
        >
          {isImporting ? "Importing…" : "Import data"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.json,text/csv,application/json"
          aria-label="Import file"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Importing replaces your current records, categories and purses. Download an example file to
        see the accepted format.
      </p>

      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" onClick={() => handleExample("csv")}>
          Example CSV
        </Button>
        <Button variant="ghost" size="sm" onClick={() => handleExample("json")}>
          Example JSON
        </Button>
      </div>
    </div>
  );
}
