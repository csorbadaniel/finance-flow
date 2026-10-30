import { useState } from "react";
import { FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useFinance } from "@/lib/finance/useFinance";
import { useLoadDemoData } from "@/lib/demo/useLoadDemoData";

export function DemoData() {
  const { transactions } = useFinance();
  const { loadDemoData, isLoading } = useLoadDemoData();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleLoad = async () => {
    try {
      const count = await loadDemoData();
      toast.success(`Added ${count} sample records`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't load demo data. Please try again.");
    }
  };

  return (
    <div>
      <Button variant="outline" disabled={isLoading || transactions.length > 0} onClick={() => setIsConfirming(true)}>
        <FlaskConical className="size-4" aria-hidden="true" />
        {isLoading ? "Loading demo…" : "Load demo data"}
      </Button>
      <AlertDialog open={isConfirming} onOpenChange={setIsConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Load demo data?</AlertDialogTitle>
            <AlertDialogDescription>
              Add 36 sample income and expense records to this device. Your existing categories,
              purses and preferences will be kept. Demo data is only available when you have no records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleLoad()}>Add sample records</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}