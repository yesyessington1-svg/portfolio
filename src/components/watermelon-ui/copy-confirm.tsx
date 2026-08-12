"use client";

/**
 * Watermelon UI · copy-confirm
 * Local adaptation: the registry ships this as a centred light-mode demo card.
 * The character-level swap animation and the spring colour transition are
 * unchanged — only the shell, palette and props are ours.
 */

import { CheckIcon, CopyIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode, useState } from "react";

interface CopyConfirmProps {
  /** The visible string (usually the same as valueToCopy). */
  title?: string;
  icon?: ReactNode;
  valueToCopy: string;
  copiedText?: string;
  copyText?: string;
}

export default function CopyConfirm({
  title,
  icon,
  valueToCopy,
  copiedText = "Copied",
  copyText = "Copy",
}: CopyConfirmProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(valueToCopy);
    } catch {
      /* clipboard blocked — the address is on screen anyway */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2.5 rounded-full border border-border bg-ink-900 py-3 pl-4 pr-5">
        {icon && <span className="text-bone-600">{icon}</span>}
        <span className="font-mono text-sm text-bone-200">
          {title ?? valueToCopy}
        </span>
      </div>

      <motion.button
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.975 }}
        animate={{ backgroundColor: copied ? "#de4536" : "#f4f4f5" }}
        transition={{ duration: 0.35 }}
        onClick={handleCopy}
        aria-label={`Copy ${valueToCopy}`}
        className="relative flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full px-5 py-3"
        style={{ color: copied ? "#fff" : "#08080a" }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={copied ? "check" : "copy"}
            initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
          >
            {copied ? (
              <CheckIcon className="size-4 stroke-[2.5]" />
            ) : (
              <CopyIcon className="size-4 stroke-[2.5]" />
            )}
          </motion.div>
        </AnimatePresence>
        <AnimatedText from={copyText} to={copiedText} isCopied={copied} />
      </motion.button>
    </div>
  );
}

const AnimatedText = ({
  from,
  to,
  isCopied,
}: {
  from: string;
  to: string;
  isCopied: boolean;
}) => {
  const activeText = isCopied ? to : from;

  return (
    <div className="flex text-sm font-medium tracking-tight will-change-transform">
      <AnimatePresence mode="popLayout" initial={false}>
        {activeText.split("").map((char, index) => (
          <motion.span
            key={char + index}
            layout
            initial={{ opacity: 0, y: 5, scale: 0.7 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 200,
                damping: 20,
                delay: 0.03 * index,
              },
            }}
            exit={{ opacity: 0, y: -5, scale: 0.7 }}
          >
            {char === " " ? " " : char}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
};
