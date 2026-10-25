"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";
import { BlurReveal } from "@/components/ui/BlurReveal";
import { FAQ_ITEMS } from "@/lib/faq";
import { FaqAnswer } from "@/components/sections/FaqAnswer";
import { DESCRIPTION_WEIGHT, GEIST_FONT, SANS_FONT, SECTION_WEIGHT } from "@/lib/fonts";

/* Design tokens (shared with the other landing sections) */
const INK = "#000c1f";
const INK_SECONDARY = "rgba(0, 12, 31, 0.68)";
const HAIRLINE = "rgba(0, 12, 31, 0.1)";
const SURFACE = "#f5f6f8";
const EASE_OUT_QUINT = [0.22, 1, 0.36, 1] as const;

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

function FAQChatItem({ question, answer, isOpen, onToggle, index }: FAQItemProps) {
  const prefersReducedMotion = useReducedMotion();
  const answerId = `faq-answer-${index}`;
  const questionId = `faq-question-${index}`;

  return (
    <div className={isOpen ? "faq-chat-item faq-chat-item--open" : "faq-chat-item"}>
      <div className="faq-question-row">
        <button
          type="button"
          onClick={onToggle}
          aria-label={isOpen ? "Collapse answer" : "Expand answer"}
          aria-expanded={isOpen}
          aria-controls={answerId}
          className="faq-toggle"
          tabIndex={-1}
        >
          <motion.span
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.32, ease: EASE_OUT_QUINT }
            }
            className="faq-toggle-icon"
          >
            <Plus size={16} strokeWidth={1.8} />
          </motion.span>
        </button>
        <button
          id={questionId}
          type="button"
          className="faq-question-bubble"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={answerId}
        >
          {question}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key={`answer-${index}`}
            id={answerId}
            role="region"
            aria-labelledby={questionId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    height: { duration: 0.4, ease: EASE_OUT_QUINT },
                    opacity: { duration: 0.24, ease: "easeOut" },
                  }
            }
            className="faq-answer-clip"
          >
            <motion.div
              initial={prefersReducedMotion ? false : { y: -6, scale: 0.985 }}
              animate={{ y: 0, scale: 1 }}
              exit={prefersReducedMotion ? undefined : { y: -4, scale: 0.99 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.36, ease: EASE_OUT_QUINT }}
              className="faq-answer-row"
            >
              <div className="faq-avatar">
                <Image
                  src="/hyd01.png"
                  alt="Hydrilla"
                  fill
                  style={{ objectFit: "contain", padding: "6px" }}
                  sizes="32px"
                />
              </div>
              <p className="faq-answer-bubble">
                <FaqAnswer text={answer} />
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection({ hideHeader = false }: { hideHeader?: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      className={hideHeader ? "faq-section faq-section--embedded" : "faq-section"}
      aria-labelledby={hideHeader ? undefined : "faq-heading"}
    >
      <style>{`
        .faq-section {
          width: 100%;
          background: #fff;
          padding: clamp(4.5rem, 3rem + 6vw, 8.5rem) 1.5rem;
          box-sizing: border-box;
          -webkit-font-smoothing: antialiased;
        }
        .faq-section--embedded {
          padding: 1.25rem 1.25rem 0.5rem;
        }
        .faq-shell {
          max-width: 46rem;
          margin: 0 auto;
        }
        .faq-header {
          text-align: center;
          margin-bottom: clamp(2.5rem, 2rem + 3vw, 4.5rem);
        }
        .faq-title {
          margin: 0;
          font-family: ${SANS_FONT};
          font-size: clamp(2.25rem, 1.7rem + 2.4vw, 3.75rem);
          font-weight: ${SECTION_WEIGHT};
          color: ${INK};
          letter-spacing: -0.035em;
          line-height: 1.05;
          text-wrap: balance;
        }
        .faq-chat {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .faq-chat-item {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }
        .faq-question-row {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 0.625rem;
        }

        /* Toggle */
        .faq-toggle {
          width: 2.25rem;
          height: 2.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: #fff;
          color: ${INK};
          border-radius: 999px;
          border: 1px solid ${HAIRLINE};
          cursor: pointer;
          transition: background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease;
        }
        .faq-toggle-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          will-change: transform;
        }
        .faq-question-row:hover .faq-toggle {
          border-color: rgba(0, 12, 31, 0.24);
        }
        .faq-chat-item--open .faq-toggle {
          background: ${INK};
          border-color: ${INK};
          color: #fff;
        }

        /* Question (user message) */
        .faq-question-bubble {
          padding: 0.875rem 1.25rem;
          border-radius: 1.25rem 1.25rem 0.375rem 1.25rem;
          background: ${INK};
          color: #fff;
          font-family: ${SANS_FONT};
          font-size: 1rem;
          font-weight: ${SECTION_WEIGHT};
          line-height: 1.5;
          letter-spacing: -0.01em;
          margin: 0;
          max-width: 30rem;
          cursor: pointer;
          text-align: left;
          border: 0;
          opacity: 0.9;
          transition: opacity 0.25s ease;
        }
        .faq-question-row:hover .faq-question-bubble,
        .faq-chat-item--open .faq-question-bubble {
          opacity: 1;
        }
        .faq-question-bubble:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: 3px;
        }

        /* Answer (Hydrilla reply) */
        .faq-answer-clip {
          overflow: hidden;
        }
        .faq-answer-row {
          display: flex;
          align-items: flex-end;
          gap: 0.625rem;
          max-width: 32rem;
          margin-right: auto;
          width: 100%;
          transform-origin: bottom left;
        }
        .faq-avatar {
          position: relative;
          flex-shrink: 0;
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          border: 1px solid ${HAIRLINE};
          overflow: hidden;
          background: #fff;
        }
        .faq-answer-bubble {
          padding: 1rem 1.25rem;
          border-radius: 1.25rem 1.25rem 1.25rem 0.375rem;
          background: ${SURFACE};
          font-family: ${GEIST_FONT};
          font-weight: ${DESCRIPTION_WEIGHT};
          font-size: 0.975rem;
          color: ${INK_SECONDARY};
          line-height: 1.65;
          margin: 0;
          flex: 1;
        }

        .faq-answer-link {
          color: ${INK};
          text-decoration: underline;
          text-decoration-color: rgba(0, 12, 31, 0.25);
          text-underline-offset: 3px;
          overflow-wrap: anywhere;
          transition: text-decoration-color 0.2s ease;
        }
        .faq-answer-link:hover {
          text-decoration-color: ${INK};
        }

        @media (prefers-reduced-motion: reduce) {
          .faq-toggle,
          .faq-question-bubble {
            transition: none;
          }
        }
        @media (max-width: 640px) {
          .faq-section:not(.faq-section--embedded) {
            padding-inline: 1rem;
          }
          .faq-section--embedded {
            padding: 0.75rem 1rem 0.25rem;
          }
          .faq-chat {
            gap: 1rem;
          }
          .faq-chat-item {
            gap: 0.75rem;
          }
          .faq-question-row {
            gap: 0.5rem;
          }
          .faq-question-bubble {
            max-width: calc(100% - 2.5rem);
            padding: 0.8125rem 1rem;
            font-size: 0.9375rem;
          }
          .faq-answer-row {
            max-width: 92%;
          }
          .faq-answer-bubble {
            padding: 0.875rem 1rem;
            font-size: 0.9125rem;
            line-height: 1.6;
          }
        }
      `}</style>

      <div className="faq-shell">
        {hideHeader ? null : (
          <header className="faq-header">
            <BlurReveal as="h2" id="faq-heading" className="faq-title">
              Questions & answers
            </BlurReveal>
          </header>
        )}

        <div className="faq-chat">
          {FAQ_ITEMS.map((item, i) => (
            <FAQChatItem
              key={item.question}
              index={i}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex((current) => (current === i ? null : i))}
            />
          ))}
        </div>
        <dl className="sr-only">
          {FAQ_ITEMS.map((item) => (
            <div key={`ssr-${item.question}`}>
              <dt>{item.question}</dt>
              <dd>{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
