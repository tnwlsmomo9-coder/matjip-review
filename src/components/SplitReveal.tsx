"use client";

import { useEffect, useState } from "react";

export interface WordPart {
  text: string;
  className?: string;
}

export type SplitToken = { type: "word"; parts: WordPart[] } | { type: "break" };

export default function SplitReveal({ tokens }: { tokens: SplitToken[] }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => setRevealed(true));
    });
    return () => cancelAnimationFrame(raf1);
  }, []);

  const wordIndices = tokens.reduce<number[]>((acc, token, i) => {
    const prev = i === 0 ? -1 : acc[i - 1];
    acc.push(token.type === "word" ? prev + 1 : prev);
    return acc;
  }, []);

  return (
    <>
      {tokens.map((token, i) => {
        if (token.type === "break") return <br key={i} />;
        const delay = Math.min(wordIndices[i] * 70, 490);
        return (
          <span
            key={i}
            className={`mr-2 inline-block transition-all duration-500 ease-out last:mr-0 ${
              revealed ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
            style={{ transitionDelay: `${delay}ms` }}
          >
            {token.parts.map((p, j) => (
              <span key={j} className={p.className}>
                {p.text}
              </span>
            ))}
          </span>
        );
      })}
    </>
  );
}
