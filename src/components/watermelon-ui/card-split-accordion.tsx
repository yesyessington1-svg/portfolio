'use client';

import React, { useState, type FC } from 'react';
import { motion, MotionConfig, type Transition } from 'motion/react';
import { ChevronDown, Send } from 'lucide-react';
import { HiCursorArrowRipple } from 'react-icons/hi2';
import { Layers } from 'lucide-react';
import { IoIosTimer } from 'react-icons/io';
import { PiHandTap } from 'react-icons/pi';
import useMeasure from 'react-use-measure';

export interface AccordionItemData {
  id: number;
  title: string;
  icon: React.ReactNode;
  content: string;
  /** local addition: right-aligned metadata (role, dates, …) */
  meta?: string;
  subtitle?: string;
}

interface AccordionItemProps {
  item: AccordionItemData;

  setOpenId: (id: number | null) => void;
  index: number;
  total: number;
  openIndex: number;
}
interface AccordionProps {
  items?: AccordionItemData[];
}

const springTransition: Transition = {
  type: 'spring',
  stiffness: 600,
  damping: 50,
  mass: 1,
};

const DEFAULT_ITEMS: AccordionItemData[] = [
  {
    id: 1,
    title: 'What is Interaction Design?',
    icon: <HiCursorArrowRipple className="size-3 -rotate-10 md:size-4" />,
    content:
      'Interaction design focuses on creating engaging interfaces with well-thought-out behaviors and actions.',
  },
  {
    id: 2,
    title: 'Principles & Patterns',
    icon: <Layers size={24} />,
    content:
      'Fundamental guidelines and repeated solutions that ensure consistency and usability in design.',
  },
  {
    id: 3,
    title: 'Usability & Accessibility',
    icon: <PiHandTap size={26} className="-rotate-20" />,
    content:
      'Designing experiences that are easy to use and accessible to people of all abilities.',
  },
  {
    id: 4,
    title: 'Prototyping & Testing',
    icon: <Send size={24} />,
    content:
      'Rapid experimentation and validation of ideas through prototypes and real user testing.',
  },
  {
    id: 5,
    title: 'UX Optimisation',
    icon: <IoIosTimer size={26} />,
    content:
      'Improving user experience by analyzing behavior and refining interactions over time.',
  },
];

const AccordionItem: FC<AccordionItemProps> = ({
  item,
  setOpenId,
  index,
  total,
  openIndex,
}) => {
  const [ref, bounds] = useMeasure();
  const isOpen = index === openIndex;

  const isFirst = index === 0;
  const isLast = index === total - 1;

  const isBeforeOpen = index === openIndex - 1;
  const isAfterOpen = index === openIndex + 1;

  const isAlone = (isAfterOpen && isLast) || (isBeforeOpen && isFirst);

  const BORDER_WIDTH = '1px';
  const BORDER_STYLE = 'solid';
  const borderTopWidth =
    isFirst || isAfterOpen || isOpen ? BORDER_WIDTH : '0px';
  const borderBottomWidth =
    isLast || isBeforeOpen || isOpen ? BORDER_WIDTH : '0px';
  const borderLeftWidth = BORDER_WIDTH;
  const borderRightWidth = BORDER_WIDTH;

  let borderTopLeftRadius = 0;
  let borderTopRightRadius = 0;
  let borderBottomLeftRadius = 0;
  let borderBottomRightRadius = 0;

  if (isOpen || isAlone) {
    borderTopLeftRadius = 10;
    borderTopRightRadius = 10;
    borderBottomLeftRadius = 10;
    borderBottomRightRadius = 10;
  } else if (isBeforeOpen) {
    borderBottomLeftRadius = 10;
    borderBottomRightRadius = 10;
  } else if (isAfterOpen) {
    borderTopLeftRadius = 10;
    borderTopRightRadius = 10;
  } else if (isFirst) {
    borderTopLeftRadius = 10;
    borderTopRightRadius = 10;
  } else if (isLast) {
    borderBottomLeftRadius = 10;
    borderBottomRightRadius = 10;
  }

  return (
    <MotionConfig transition={springTransition}>
      <motion.li layout>
        <motion.div
          animate={{
            borderTopLeftRadius,
            borderTopRightRadius,
            borderBottomLeftRadius,
            borderBottomRightRadius,
          }}
          className="overflow-hidden border-solid border-border bg-ink-900 will-change-transform dark:border-border dark:bg-ink-900"
          style={{
            borderTopWidth,
            borderBottomWidth,
            borderLeftWidth,
            borderRightWidth,
            borderStyle: BORDER_STYLE,
            marginBlock: isOpen ? '10px' : '0px',
          }}
        >
          <button
            onClick={() => setOpenId(isOpen ? null : item.id)}
            className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-5 md:px-7 md:py-6"
          >
            <div className="flex min-w-0 items-center gap-4">
              <span className="text-bone-600">{item.icon}</span>

              <span className="text-left text-base font-medium tracking-tight text-bone-50 md:text-xl dark:text-bone-50">
                {item.title}
                {item.subtitle && (
                  <span className="ml-3 font-mono text-[11px] font-normal tracking-wide text-bone-500">
                    {item.subtitle}
                  </span>
                )}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-5">
              {item.meta && (
                <span className="hidden font-mono text-[11px] tracking-wide text-bone-500 sm:inline">
                  {item.meta}
                </span>
              )}
            <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
              <ChevronDown className="size-5 text-bone-600 md:size-6 dark:text-bone-600" />
            </motion.div>
            </div>
          </button>

          <motion.div
            initial={false}
            animate={{
              height: isOpen ? bounds.height : 0,
              opacity: isOpen ? 1 : 0,
            }}
            className="overflow-hidden will-change-transform"
          >
            <div ref={ref}>
              <div className="px-5 pb-6 md:px-7 md:pb-8 max-w-2xl text-sm leading-relaxed text-bone-400 md:text-[0.95rem] dark:text-bone-400">
                {item.content}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.li>
    </MotionConfig>
  );
};

export const AccordionApp: FC<AccordionProps> = ({ items }) => {
  const defaultItems = items ?? DEFAULT_ITEMS;

  const [openId, setOpenId] = useState<number | null>(null);

  const openIndex = defaultItems.findIndex((item) => item.id === openId);

  return (
    <div className="flex w-full flex-col items-stretch justify-center transition-colors duration-500">
      <ul className="w-full">
        {defaultItems.map((item, index) => (
          <AccordionItem
            key={item.id}
            item={item}
            setOpenId={setOpenId}
            index={index}
            total={defaultItems.length}
            openIndex={openIndex}
          />
        ))}
      </ul>
    </div>
  );
};
