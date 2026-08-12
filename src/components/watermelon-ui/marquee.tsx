/* Watermelon UI · marquee
 * Local change: the registry version applies `animate-marquee`, whose
 * value comes from a Tailwind theme key that resolves var(--duration)
 * on :root where it does not exist — so the animation computes to
 * `none` and nothing moves. Swapped for the .marquee-track class in
 * globals.css, which resolves the duration on the element instead.
 */

import { type ComponentPropsWithoutRef } from "react"

import { cn } from "@/lib/utils"

interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Optional CSS class name to apply custom styles
   */
  className?: string
  /**
   * Whether to reverse the animation direction
   * @default false
   */
  reverse?: boolean
  /**
   * Whether to pause the animation on hover
   * @default false
   */
  pauseOnHover?: boolean
  /**
   * Content to be displayed in the marquee
   */
  children: React.ReactNode
  /**
   * Whether to animate vertically instead of horizontally
   * @default false
   */
  vertical?: boolean
  /**
   * Number of times to repeat the content
   * @default 4
   */
  repeat?: number
  /**
   * Animation speed variant
   * @default "normal"
   */
  speed?: "slow" | "normal" | "fast"
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 5,
  speed = "normal",
  ...props
}: MarqueeProps) {
  const speedVariants = {
    slow: "[--duration:120s]",
    normal: "[--duration:40s]",
    fast: "[--duration:10s]",
  }

  return (
    <div
      {...props}
      className={cn(
        "group flex [gap:var(--gap)] overflow-hidden p-1 [--gap:6px]",
        speedVariants[speed],
        {
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn("flex shrink-0 justify-around [gap:var(--gap)]", {
              "marquee-track flex-row": !vertical,
              "marquee-track-vertical flex-col": vertical,
              "group-hover:[animation-play-state:paused]": pauseOnHover,
              "[animation-direction:reverse]": reverse,
            })}
          >
            {children}
          </div>
        ))}
    </div>
  )
}
