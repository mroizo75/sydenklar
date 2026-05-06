'use client'

import { useState } from 'react'

interface FaqItem {
  question: string
  answer: string
}

interface Props {
  items: FaqItem[]
}

export default function FaqAccordion({ items }: Props) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="divide-y divide-[var(--border)]">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between gap-4 py-5 text-left"
            aria-expanded={open === i}
          >
            <span className="text-[var(--deep)] font-medium text-base leading-snug">
              {item.question}
            </span>
            <span
              className="shrink-0 w-6 h-6 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--muted)] transition-transform duration-200"
              style={{ transform: open === i ? 'rotate(45deg)' : 'none' }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
          </button>
          <div
            className="overflow-hidden transition-all duration-200"
            style={{ maxHeight: open === i ? '600px' : '0' }}
          >
            <p className="text-[var(--muted)] text-sm leading-relaxed pb-5">
              {item.answer}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
