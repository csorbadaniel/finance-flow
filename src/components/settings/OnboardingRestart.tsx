import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { financeStore, useFinance } from "@/lib/finance/useFinance";

/** Lets the user replay the first-run tutorial. */
export function OnboardingRestart() {
  const { onboardingSeen } = useFinance();
  const navigate = useNavigate();

  const handleRestart = () => {
    financeStore.setOnboardingSeen(false);
    toast.success("Tutorial restarted");
    void navigate({ to: "/" });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium">Tutorial</p>
        <p className="text-xs text-muted-foreground">
          {onboardingSeen
            ? "You have already completed the intro tour."
            : "The intro tour will show the next time you open the home page."}
        </p>
      </div>
      <Button type="button" variant="outline" onClick={handleRestart}>
        Restart tutorial
      </Button>
    </div>
  );
}
