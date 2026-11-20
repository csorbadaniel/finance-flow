import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "./button";
import { cn } from "@/lib/utils";

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 pointer-events-auto", className)}
      classNames={{
        root: "relative w-[280px]",
        months: "relative",
        month: "space-y-3",
        month_caption: "mx-10 flex h-9 items-center justify-center text-sm font-medium",
        dropdowns: "flex items-center gap-2",
        dropdown_root: "relative rounded-md px-1 focus-within:ring-1 focus-within:ring-ring",
        dropdown: "absolute inset-0 z-10 w-full cursor-pointer opacity-0",
        caption_label: "flex items-center gap-1 whitespace-nowrap",
        nav: "absolute inset-x-0 top-0 flex justify-between",
        button_previous: cn(buttonVariants({ variant: "outline", size: "icon" }), "size-8"),
        button_next: cn(buttonVariants({ variant: "outline", size: "icon" }), "size-8"),
        month_grid: "w-full border-collapse",
        weekdays: "text-muted-foreground",
        weekday: "w-10 text-xs font-normal",
        week: "h-10",
        day: "p-0 text-center text-sm",
        day_button: cn(buttonVariants({ variant: "ghost" }), "size-9 p-0 font-normal"),
        selected: "[&_button]:bg-primary [&_button]:text-primary-foreground",
        today: "[&_button]:border [&_button]:border-primary",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-30",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="size-4" />
          ) : orientation === "right" ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronRight className="size-3 rotate-90" />
          ),
      }}
      {...props}
    />
  );
}
