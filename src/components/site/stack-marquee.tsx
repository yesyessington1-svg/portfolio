"use client";

import type { ComponentType } from "react";
import { ChefHat, Terminal } from "lucide-react";
import {
  SiBlender,
  SiBurpsuite,
  SiDocker,
  SiExpress,
  SiGit,
  SiGreensock,
  SiHtml5,
  SiJavascript,
  SiKalilinux,
  SiLinux,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPython,
  SiReact,
  SiTailwindcss,
  SiTypescript,
  SiWireshark,
} from "react-icons/si";
import { Marquee } from "@/components/watermelon-ui/marquee";
import { site } from "@/content/site";

/**
 * The tooling band. Marks only, no names — the row reads as a texture rather
 * than a list.
 *
 * Monochrome by default, brand colour on the one you hover. Ten brand colours
 * firing at once is the rainbow this site avoids; one at a time is a detail.
 * Hovering also pauses the row and shows the name as a native tooltip, so
 * nothing is lost by dropping the labels.
 *
 * Names come from `site.stack` and map to a mark here, matched loosely, so
 * "Node", "node.js" and "NodeJS" all land on the same icon. A name with no
 * entry falls back to a terminal glyph rather than breaking.
 */
type Brand = { Icon: ComponentType<{ className?: string }>; color: string };

const BRANDS: Record<string, Brand> = {
  javascript: { Icon: SiJavascript, color: "#F7DF1E" },
  typescript: { Icon: SiTypescript, color: "#3178C6" },
  node: { Icon: SiNodedotjs, color: "#5FA04E" },
  express: { Icon: SiExpress, color: "#F4F4F5" },
  python: { Icon: SiPython, color: "#3776AB" },
  linux: { Icon: SiLinux, color: "#FCC624" },
  blender: { Icon: SiBlender, color: "#E87D0D" },
  git: { Icon: SiGit, color: "#F05032" },
  burp: { Icon: SiBurpsuite, color: "#FF6633" },
  // GCHQ never published a usable mark for CyberChef, but its logo is a chef.
  cyberchef: { Icon: ChefHat, color: "#DE4536" },
  // Spares, so adding any of these to site.stack just works.
  react: { Icon: SiReact, color: "#61DAFB" },
  next: { Icon: SiNextdotjs, color: "#F4F4F5" },
  postgres: { Icon: SiPostgresql, color: "#4169E1" },
  tailwind: { Icon: SiTailwindcss, color: "#06B6D4" },
  gsap: { Icon: SiGreensock, color: "#0AE448" },
  docker: { Icon: SiDocker, color: "#2496ED" },
  wireshark: { Icon: SiWireshark, color: "#1679A7" },
  html: { Icon: SiHtml5, color: "#E34F26" },
  kali: { Icon: SiKalilinux, color: "#557C94" },
};

/** "Node.js" → node, "Burp Suite" → burp. */
function brandFor(name: string): Brand {
  const key = name.toLowerCase().replace(/[^a-z]/g, "");
  if (BRANDS[key]) return BRANDS[key];
  const hit = Object.keys(BRANDS).find((k) => key.startsWith(k));
  return hit ? BRANDS[hit] : { Icon: Terminal, color: "#9A9AA4" };
}

function Mark({ name }: { name: string }) {
  const { Icon, color } = brandFor(name);
  return (
    <span
      title={name}
      aria-label={name}
      className="group/mark flex shrink-0 items-center justify-center px-8 md:px-11"
      // Per-brand hover colour, so it has to be inline.
      style={{ ["--brand" as string]: color }}
    >
      <Icon className="size-7 shrink-0 text-bone-600 transition-colors duration-300 group-hover/mark:text-[var(--brand)] md:size-8" />
    </span>
  );
}

export function StackMarquee() {
  return (
    <section
      aria-label="Tools and technologies"
      className="relative border-y border-border bg-ink-900/40 py-9"
    >
      <div
        style={{
          maskImage:
            "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)",
        }}
      >
        {/* `speed="normal"` is 40s for one full loop. The registry's "slow" is
            120s, which at this width is about 13px a second — technically
            moving, indistinguishable from stopped. */}
        <Marquee speed="normal" pauseOnHover repeat={4} className="[--gap:0px]">
          {site.stack.map((name) => (
            <Mark key={name} name={name} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
