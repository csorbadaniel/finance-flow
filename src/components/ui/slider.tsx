import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";
const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, value, defaultValue, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-8 w-full touch-none select-none items-center data-[disabled]:opacity-40",
      className,
    )}
    value={value}
    defaultValue={defaultValue}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full rounded-full bg-primary" />
    </SliderPrimitive.Track>
    {(value ?? defaultValue ?? [0]).map((_, index) => (
      <SliderPrimitive.Thumb
        key={index}
        aria-label={index === 0 ? "From date slider" : "To date slider"}
        className="block size-5 rounded-full border-2 border-primary bg-background shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none"
      />
    ))}
  </SliderPrimitive.Root>
));
Slider.displayName = "Slider";
export { Slider };
