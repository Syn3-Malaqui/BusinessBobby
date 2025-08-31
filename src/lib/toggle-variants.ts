import { cva } from "class-variance-authority"

export const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent/60 data-[state=on]:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent hover:bg-muted/60 hover:text-foreground",
        outline:
          "border border-input bg-transparent hover:bg-accent/20 hover:text-accent-foreground data-[state=on]:border-accent",
        soft:
          "bg-transparent hover:bg-primary/10 data-[state=on]:bg-primary/20 data-[state=on]:text-primary",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-8 px-2.5 text-xs",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
