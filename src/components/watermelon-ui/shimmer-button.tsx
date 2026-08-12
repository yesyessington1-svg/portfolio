import { cn } from "@/lib/utils";

/**
 * Watermelon UI · shimmer-button
 * Local addition: `as`. The registry version is always a <button>, which
 * can't be nested inside another button or an anchor without producing
 * invalid HTML (and a React hydration error). Render it as a "span" when
 * something outside it owns the click.
 */
interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  as?: "button" | "span";
}

export function ShimmerButton({
  children,
  className,
  as: Tag = "button",
  ...props
}: ShimmerButtonProps) {
  return (
    <Tag
      className={cn(
        "relative inline-flex overflow-hidden rounded-lg px-6 py-3 font-medium",
        "bg-primary text-primary-foreground",
        "transition-shadow duration-300 hover:shadow-lg",
        "group/shimmer",
        className
      )}
      {...(Tag === "span" ? {} : props)}
    >
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 -translate-x-full",
          "bg-linear-to-r from-transparent via-white/25 to-transparent",
          "transition-transform duration-700 group-hover/shimmer:translate-x-full group-hover:translate-x-full"
        )}
      />
    </Tag>
  );
}
