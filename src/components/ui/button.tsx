import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Material 3-style pill buttons.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[background-color,box-shadow,color] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[1.1em] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        filled: "bg-primary text-primary-fg hover:shadow-card hover:brightness-110",
        tonal: "bg-g-blue-tint text-fg hover:shadow-card",
        outlined: "border border-line text-primary hover:bg-primary/[0.08]",
        text: "text-primary hover:bg-primary/[0.08]",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-10 px-6 text-sm",
        lg: "h-12 px-7 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "filled", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
